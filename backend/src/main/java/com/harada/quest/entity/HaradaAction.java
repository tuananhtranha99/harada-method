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

@Entity
@Table(name = "harada_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HaradaAction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pillar_id", nullable = false)
    private HaradaPillar pillar;

    @Column(name = "slot_index", nullable = false)
    private Short slotIndex;

    @Column(nullable = false, length = 200)
    private String title;

    @Builder.Default
    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward = 25;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}

