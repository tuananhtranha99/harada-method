package com.harada.quest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "character_name", nullable = false, length = 60)
    private String characterName;

    @Builder.Default
    @Column(name = "character_level", nullable = false)
    private Integer characterLevel = 1;

    @Builder.Default
    @Column(name = "total_xp", nullable = false)
    private Integer totalXp = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer hp = 100;

    @Builder.Default
    @Column(name = "max_hp", nullable = false)
    private Integer maxHp = 100;

    @Builder.Default
    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "consecutive_missed_days", nullable = false)
    private Integer consecutiveMissedDays = 0;

    @Column(name = "last_active_date")
    private LocalDate lastActiveDate;
}

