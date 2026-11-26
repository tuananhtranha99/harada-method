package com.harada.quest.repository;

import com.harada.quest.entity.HaradaPillar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HaradaPillarRepository extends JpaRepository<HaradaPillar, UUID> {
    List<HaradaPillar> findByGoalIdOrderBySlotIndexAsc(UUID goalId);
}

