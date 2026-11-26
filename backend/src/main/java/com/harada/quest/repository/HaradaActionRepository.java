package com.harada.quest.repository;

import com.harada.quest.entity.HaradaAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HaradaActionRepository extends JpaRepository<HaradaAction, UUID> {
    List<HaradaAction> findByPillarIdAndIsActiveTrueOrderBySlotIndexAsc(UUID pillarId);
}

