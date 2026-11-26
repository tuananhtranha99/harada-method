package com.harada.quest.service.impl;

import com.harada.quest.dto.request.CreateActionRequest;
import com.harada.quest.dto.request.UpdateGoalRequest;
import com.harada.quest.dto.request.UpdatePillarRequest;
import com.harada.quest.dto.response.ActionResponse;
import com.harada.quest.dto.response.DashboardResponse;
import com.harada.quest.dto.response.GearItemResponse;
import com.harada.quest.dto.response.PillarResponse;
import com.harada.quest.entity.DailyActionLog;
import com.harada.quest.entity.GearItem;
import com.harada.quest.entity.HaradaAction;
import com.harada.quest.entity.HaradaGoal;
import com.harada.quest.entity.HaradaPillar;
import com.harada.quest.entity.User;
import com.harada.quest.entity.UserGearUnlock;
import com.harada.quest.exception.BusinessException;
import com.harada.quest.exception.ResourceNotFoundException;
import com.harada.quest.mapper.UserMapper;
import com.harada.quest.repository.DailyActionLogRepository;
import com.harada.quest.repository.GearItemRepository;
import com.harada.quest.repository.HaradaActionRepository;
import com.harada.quest.repository.HaradaGoalRepository;
import com.harada.quest.repository.HaradaPillarRepository;
import com.harada.quest.repository.UserGearUnlockRepository;
import com.harada.quest.repository.UserRepository;
import com.harada.quest.service.HaradaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HaradaServiceImpl implements HaradaService {

    private static final int MAX_ACTIONS_PER_PILLAR = 8;
    private static final int XP_PER_LEVEL = 100;
    private static final List<String[]> DEFAULT_PILLARS = List.of(
            new String[]{"Body & Stamina", "STR"},
            new String[]{"Deep Learning", "INT"},
            new String[]{"Sleep & Health", "VIT"},
            new String[]{"Reflection", "WIS"},
            new String[]{"Network & Service", "CHA"},
            new String[]{"Core Craft", "DEX"},
            new String[]{"Focus & Deep Work", "FOC"},
            new String[]{"Hardcore Grit", "WIL"}
    );

    private final UserRepository userRepository;
    private final HaradaGoalRepository goalRepository;
    private final HaradaPillarRepository pillarRepository;
    private final HaradaActionRepository actionRepository;
    private final DailyActionLogRepository dailyLogRepository;
    private final GearItemRepository gearItemRepository;
    private final UserGearUnlockRepository gearUnlockRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public DashboardResponse getDashboard(UUID userId) {
        User user = findUser(userId);
        HaradaGoal goal = getOrCreateStarterGoal(user);
        syncGearUnlocks(user);
        return buildDashboard(user, goal);
    }

    @Override
    @Transactional
    public DashboardResponse updateGoal(UUID userId, UpdateGoalRequest request) {
        User user = findUser(userId);
        HaradaGoal goal = getOrCreateStarterGoal(user);
        goal.setTitle(request.title().trim());
        goal.setPurpose(request.purpose());
        goalRepository.save(goal);
        return buildDashboard(user, goal);
    }

    @Override
    @Transactional
    public DashboardResponse updatePillar(UUID userId, Short slotIndex, UpdatePillarRequest request) {
        User user = findUser(userId);
        HaradaGoal goal = getOrCreateStarterGoal(user);
        HaradaPillar pillar = findPillarBySlot(goal.getId(), slotIndex);
        pillar.setTitle(request.title().trim());
        pillarRepository.save(pillar);
        return buildDashboard(user, goal);
    }

    @Override
    @Transactional
    public DashboardResponse addAction(UUID userId, Short slotIndex, CreateActionRequest request) {
        User user = findUser(userId);
        HaradaGoal goal = getOrCreateStarterGoal(user);
        HaradaPillar pillar = findPillarBySlot(goal.getId(), slotIndex);

        List<HaradaAction> existing = actionRepository.findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(pillar.getId());
        if (existing.size() >= MAX_ACTIONS_PER_PILLAR) {
            throw new BusinessException("Each pillar can have at most 8 active actions", HttpStatus.BAD_REQUEST);
        }

        short nextSlot = (short) (existing.stream()
                .mapToInt(HaradaAction::getSlotIndex)
                .max()
                .orElse(0) + 1);

        HaradaAction action = HaradaAction.builder()
                .pillar(pillar)
                .slotIndex(nextSlot)
                .title(request.title().trim())
                .build();
        actionRepository.save(action);

        return buildDashboard(user, goal);
    }

    @Override
    @Transactional
    public DashboardResponse toggleActionToday(UUID userId, UUID actionId) {
        User user = findUser(userId);
        HaradaAction action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Action not found"));

        HaradaPillar pillar = action.getPillar();
        HaradaGoal goal = pillar.getGoal();
        if (!goal.getUser().getId().equals(userId)) {
            throw new BusinessException("Action does not belong to current user", HttpStatus.FORBIDDEN);
        }

        LocalDate today = LocalDate.now();
        Optional<DailyActionLog> existingLog = dailyLogRepository.findByActionIdAndLogDate(actionId, today);

        if (existingLog.isPresent()) {
            dailyLogRepository.delete(existingLog.get());
            applyXpDelta(user, pillar, -action.getXpReward());
        } else {
            dailyLogRepository.save(DailyActionLog.builder()
                    .action(action)
                    .user(user)
                    .logDate(today)
                    .build());
            applyXpDelta(user, pillar, action.getXpReward());
            updateStreakOnCompletion(user, today);
            syncGearUnlocks(user);
        }

        pillarRepository.save(pillar);
        userRepository.save(user);
        return buildDashboard(user, goal);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private HaradaPillar findPillarBySlot(UUID goalId, Short slotIndex) {
        if (slotIndex < 1 || slotIndex > 8) {
            throw new BusinessException("Pillar slotIndex must be between 1 and 8");
        }
        return pillarRepository.findByGoalIdOrderBySlotIndexAsc(goalId).stream()
                .filter(p -> p.getSlotIndex().equals(slotIndex))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Pillar not found for slot " + slotIndex));
    }

    private HaradaGoal getOrCreateStarterGoal(User user) {
        return goalRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(user.getId())
                .orElseGet(() -> createStarterGoalWithEightPillars(user));
    }

    private HaradaGoal createStarterGoalWithEightPillars(User user) {
        HaradaGoal goal = goalRepository.save(HaradaGoal.builder()
                .user(user)
                .title("Master Daily Discipline")
                .purpose("Build unstoppable consistency using the Harada Method.")
                .build());

        for (int i = 0; i < DEFAULT_PILLARS.size(); i++) {
            String[] def = DEFAULT_PILLARS.get(i);
            pillarRepository.save(HaradaPillar.builder()
                    .goal(goal)
                    .slotIndex((short) (i + 1))
                    .title(def[0])
                    .statCode(def[1])
                    .build());
        }
        log.info("Bootstrapped starter Harada goal and 8 pillars for userId={}", user.getId());
        return goal;
    }

    private void applyXpDelta(User user, HaradaPillar pillar, int delta) {
        int nextTotalXp = Math.max(0, user.getTotalXp() + delta);
        user.setTotalXp(nextTotalXp);
        user.setCharacterLevel((nextTotalXp / XP_PER_LEVEL) + 1);

        int nextStatXp = Math.max(0, pillar.getStatXp() + delta);
        pillar.setStatXp(nextStatXp);
        pillar.setStatLevel((nextStatXp / XP_PER_LEVEL) + 1);
    }

    private void updateStreakOnCompletion(User user, LocalDate today) {
        LocalDate lastActive = user.getLastActiveDate();
        if (lastActive == null) {
            user.setCurrentStreak(1);
        } else if (lastActive.equals(today.minusDays(1))) {
            user.setCurrentStreak(user.getCurrentStreak() + 1);
        } else if (!lastActive.equals(today)) {
            user.setCurrentStreak(1);
        }
        user.setConsecutiveMissedDays(0);
        user.setLastActiveDate(today);
    }

    private void syncGearUnlocks(User user) {
        List<GearItem> eligible = gearItemRepository
                .findByRequiredLevelLessThanEqualOrderByRequiredLevelAsc(user.getCharacterLevel());
        for (GearItem item : eligible) {
            if (!gearUnlockRepository.existsByUserIdAndGearItemId(user.getId(), item.getId())) {
                gearUnlockRepository.save(UserGearUnlock.builder()
                        .user(user)
                        .gearItem(item)
                        .isEquipped(true)
                        .build());
            }
        }
    }

    private DashboardResponse buildDashboard(User user, HaradaGoal goal) {
        LocalDate today = LocalDate.now();
        Set<UUID> completedActionIds = dailyLogRepository.findByUserIdAndLogDate(user.getId(), today).stream()
                .map(logEntry -> logEntry.getAction().getId())
                .collect(Collectors.toSet());

        List<PillarResponse> pillars = pillarRepository.findByGoalIdOrderBySlotIndexAsc(goal.getId()).stream()
                .map(pillar -> {
                    List<ActionResponse> actions = actionRepository
                            .findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(pillar.getId()).stream()
                            .map(action -> new ActionResponse(
                                    action.getId(),
                                    action.getSlotIndex(),
                                    action.getTitle(),
                                    action.getXpReward(),
                                    completedActionIds.contains(action.getId())
                            ))
                            .toList();

                    boolean litToday = !actions.isEmpty() && actions.stream().allMatch(ActionResponse::completedToday);
                    return new PillarResponse(
                            pillar.getId(),
                            pillar.getSlotIndex(),
                            pillar.getTitle(),
                            pillar.getStatCode(),
                            pillar.getStatLevel(),
                            pillar.getStatXp(),
                            litToday,
                            actions
                    );
                })
                .toList();

        List<GearItemResponse> unlockedGear = gearUnlockRepository.findByUserId(user.getId()).stream()
                .map(unlock -> {
                    GearItem item = unlock.getGearItem();
                    return new GearItemResponse(
                            item.getId(),
                            item.getCode(),
                            item.getName(),
                            item.getCategory(),
                            item.getRequiredLevel(),
                            item.getSpriteKey(),
                            unlock.getIsEquipped()
                    );
                })
                .toList();

        return new DashboardResponse(
                userMapper.toProfileResponse(user),
                goal.getId(),
                goal.getTitle(),
                goal.getPurpose(),
                pillars,
                unlockedGear
        );
    }
}

