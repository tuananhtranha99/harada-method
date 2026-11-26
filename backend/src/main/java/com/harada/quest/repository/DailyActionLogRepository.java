package com.harada.quest.repository;

import com.harada.quest.entity.DailyActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyActionLogRepository extends JpaRepository<DailyActionLog, UUID> {
    List<DailyActionLog> findByUserIdAndLogDate(UUID userId, LocalDate logDate);
    Optional<DailyActionLog> findByActionIdAndLogDate(UUID actionId, LocalDate logDate);
    boolean existsByActionIdAndLogDate(UUID actionId, LocalDate logDate);
}
