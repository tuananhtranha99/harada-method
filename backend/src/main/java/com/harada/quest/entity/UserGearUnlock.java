package com.harada.quest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_gear_unlocks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGearUnlock extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "gear_item_id", nullable = false)
    private GearItem gearItem;

    @Builder.Default
    @Column(name = "is_equipped", nullable = false)
    private Boolean isEquipped = false;

    @Builder.Default
    @Column(name = "unlocked_at", nullable = false)
    private Instant unlockedAt = Instant.now();
}

