package com.harada.quest.repository;

import com.harada.quest.entity.HaradaGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HaradaGoalRepository extends JpaRepository<HaradaGoal, UUID> {
    Optional<HaradaGoal> findFirstByUserIdAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);
}

