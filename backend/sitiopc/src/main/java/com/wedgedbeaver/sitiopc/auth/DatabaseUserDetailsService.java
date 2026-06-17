package com.wedgedbeaver.sitiopc.auth;

import com.wedgedbeaver.sitiopc.user.User;
import com.wedgedbeaver.sitiopc.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public DatabaseUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow();

        String authority = user.getRole() != null ? "ROLE_" + user.getRole() : "ROLE_USER";
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(authority)
                .build();
    }
}