package com.harada.quest.repository;

import com.harada.quest.entity.UserGearUnlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserGearUnlockRepository extends JpaRepository<UserGearUnlock, UUID> {
    List<UserGearUnlock> findByUserId(UUID userId);
    boolean existsByUserIdAndGearItemId(UUID userId, UUID gearItemId);
}

