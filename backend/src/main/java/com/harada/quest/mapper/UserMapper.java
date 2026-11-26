package com.harada.quest.mapper;

import com.harada.quest.dto.response.UserProfileResponse;
import com.harada.quest.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserProfileResponse toProfileResponse(User user);
}

