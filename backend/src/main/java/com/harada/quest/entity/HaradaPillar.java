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
@Table(name = "harada_pillars")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HaradaPillar extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    private HaradaGoal goal;

    @Column(name = "slot_index", nullable = false)
    private Short slotIndex;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(name = "stat_code", nullable = false, length = 16)
    private String statCode;

    @Builder.Default
    @Column(name = "stat_level", nullable = false)
    private Integer statLevel = 1;

    @Builder.Default
    @Column(name = "stat_xp", nullable = false)
    private Integer statXp = 0;
}

