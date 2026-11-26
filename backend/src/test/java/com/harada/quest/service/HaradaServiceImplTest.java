package com.harada.quest.service;

import com.harada.quest.dto.request.CreateActionRequest;
import com.harada.quest.dto.response.DashboardResponse;
import com.harada.quest.dto.response.UserProfileResponse;
import com.harada.quest.entity.DailyActionLog;
import com.harada.quest.entity.HaradaAction;
import com.harada.quest.entity.HaradaGoal;
import com.harada.quest.entity.HaradaPillar;
import com.harada.quest.entity.User;
import com.harada.quest.exception.BusinessException;
import com.harada.quest.mapper.UserMapper;
import com.harada.quest.repository.DailyActionLogRepository;
import com.harada.quest.repository.GearItemRepository;
import com.harada.quest.repository.HaradaActionRepository;
import com.harada.quest.repository.HaradaGoalRepository;
import com.harada.quest.repository.HaradaPillarRepository;
import com.harada.quest.repository.UserGearUnlockRepository;
import com.harada.quest.repository.UserRepository;
import com.harada.quest.service.impl.HaradaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HaradaServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private HaradaGoalRepository goalRepository;
    @Mock
    private HaradaPillarRepository pillarRepository;
    @Mock
    private HaradaActionRepository actionRepository;
    @Mock
    private DailyActionLogRepository dailyLogRepository;
    @Mock
    private GearItemRepository gearItemRepository;
    @Mock
    private UserGearUnlockRepository gearUnlockRepository;
    @Mock
    private UserMapper userMapper;

    private HaradaServiceImpl haradaService;

    @BeforeEach
    void setUp() {
        haradaService = new HaradaServiceImpl(
                userRepository,
                goalRepository,
                pillarRepository,
                actionRepository,
                dailyLogRepository,
                gearItemRepository,
                gearUnlockRepository,
                userMapper
        );
    }

    @Test
    void getDashboard_returnsExistingGoalAndPillars() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .characterName("PixelHero")
                .characterLevel(1)
                .totalXp(0)
                .build();
        user.setId(userId);

        HaradaGoal goal = HaradaGoal.builder()
                .user(user)
                .title("Master Daily Discipline")
                .build();
        goal.setId(UUID.randomUUID());

        HaradaPillar pillar = HaradaPillar.builder()
                .goal(goal)
                .slotIndex((short) 1)
                .title("Body & Stamina")
                .statCode("STR")
                .statLevel(1)
                .statXp(0)
                .build();
        pillar.setId(UUID.randomUUID());

        UserProfileResponse profile = new UserProfileResponse(
                userId, "hero@test.com", "PixelHero", 1, 0, 100, 100, 0, 0);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(goalRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)).thenReturn(Optional.of(goal));
        when(gearItemRepository.findByRequiredLevelLessThanEqualOrderByRequiredLevelAsc(1)).thenReturn(Collections.emptyList());
        when(dailyLogRepository.findByUserIdAndLogDate(any(), any())).thenReturn(Collections.emptyList());
        when(pillarRepository.findByGoalIdOrderBySlotIndexAsc(goal.getId())).thenReturn(List.of(pillar));
        when(actionRepository.findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(pillar.getId())).thenReturn(Collections.emptyList());
        when(gearUnlockRepository.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(userMapper.toProfileResponse(user)).thenReturn(profile);

        DashboardResponse dashboard = haradaService.getDashboard(userId);

        assertNotNull(dashboard);
        assertEquals("Master Daily Discipline", dashboard.goalTitle());
        assertEquals(1, dashboard.pillars().size());
        assertEquals("STR", dashboard.pillars().get(0).statCode());
    }

    @Test
    void addAction_throwsWhenMaxActionsExceeded() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().build();
        user.setId(userId);

        HaradaGoal goal = HaradaGoal.builder().user(user).title("Test").build();
        UUID goalId = UUID.randomUUID();
        goal.setId(goalId);

        HaradaPillar pillar = HaradaPillar.builder().goal(goal).slotIndex((short) 1).build();
        pillar.setId(UUID.randomUUID());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(goalRepository.findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId)).thenReturn(Optional.of(goal));
        when(pillarRepository.findByGoalIdOrderBySlotIndexAsc(goalId)).thenReturn(List.of(pillar));

        List<HaradaAction> fullList = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            fullList.add(HaradaAction.builder().slotIndex((short) (i + 1)).build());
        }
        when(actionRepository.findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(pillar.getId())).thenReturn(fullList);

        CreateActionRequest req = new CreateActionRequest("9th action");
        assertThrows(BusinessException.class, () -> haradaService.addAction(userId, (short) 1, req));
    }

    @Test
    void toggleActionToday_addsDailyLogAndAwardsXp() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .characterName("PixelHero")
                .characterLevel(1)
                .totalXp(0)
                .currentStreak(0)
                .build();
        user.setId(userId);

        HaradaGoal goal = HaradaGoal.builder().user(user).title("Test").build();
        goal.setId(UUID.randomUUID());

        HaradaPillar pillar = HaradaPillar.builder()
                .goal(goal)
                .slotIndex((short) 1)
                .statCode("STR")
                .statLevel(1)
                .statXp(0)
                .build();
        pillar.setId(UUID.randomUUID());

        HaradaAction action = HaradaAction.builder()
                .pillar(pillar)
                .slotIndex((short) 1)
                .title("Run 20 mins")
                .xpReward(25)
                .build();
        UUID actionId = UUID.randomUUID();
        action.setId(actionId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(actionRepository.findById(actionId)).thenReturn(Optional.of(action));
        when(dailyLogRepository.findByActionIdAndLogDate(actionId, LocalDate.now())).thenReturn(Optional.empty());
        when(gearItemRepository.findByRequiredLevelLessThanEqualOrderByRequiredLevelAsc(1)).thenReturn(Collections.emptyList());
        when(pillarRepository.findByGoalIdOrderBySlotIndexAsc(goal.getId())).thenReturn(List.of(pillar));
        when(actionRepository.findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(pillar.getId())).thenReturn(List.of(action));
        when(dailyLogRepository.findByUserIdAndLogDate(any(), any())).thenReturn(Collections.emptyList());
        when(gearUnlockRepository.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(userMapper.toProfileResponse(user)).thenReturn(new UserProfileResponse(
                userId, "hero@test.com", "PixelHero", 1, 25, 100, 100, 1, 0));

        DashboardResponse response = haradaService.toggleActionToday(userId, actionId);

        assertNotNull(response);
        verify(dailyLogRepository).save(any(DailyActionLog.class));
        assertEquals(25, user.getTotalXp());
        assertEquals(1, user.getCurrentStreak());
    }
}
