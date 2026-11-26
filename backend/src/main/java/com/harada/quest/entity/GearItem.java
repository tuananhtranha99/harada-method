package com.harada.quest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gear_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GearItem extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 32)
    private String category;

    @Column(name = "required_level", nullable = false)
    private Integer requiredLevel;

    @Column(name = "required_stat_code", length = 16)
    private String requiredStatCode;

    @Column(name = "sprite_key", nullable = false, length = 64)
    private String spriteKey;

    @Column(columnDefinition = "TEXT")
    private String description;
}

