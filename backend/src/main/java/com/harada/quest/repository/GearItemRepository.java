package com.harada.quest.repository;

import com.harada.quest.entity.GearItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GearItemRepository extends JpaRepository<GearItem, UUID> {
    List<GearItem> findByRequiredLevelLessThanEqualOrderByRequiredLevelAsc(Integer level);
}

