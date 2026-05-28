package agora.seguridad;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class ConfigSeguridad
{
    private final JwtUtil jwt_util;

    public ConfigSeguridad(JwtUtil jwt_util)
    {
        this.jwt_util = jwt_util;
    }

    @Bean
    public SecurityFilterChain filter_chain(HttpSecurity http) throws Exception
    {
        http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource())).authorizeHttpRequests(auth -> auth.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR).permitAll().requestMatchers(new AntPathRequestMatcher("/"), new AntPathRequestMatcher("/login"), new AntPathRequestMatcher("/registro"), new AntPathRequestMatcher("/perfil-setup"), new AntPathRequestMatcher("/api/auth/login"), new AntPathRequestMatcher("/api/auth/registro"), new AntPathRequestMatcher("/error"), new AntPathRequestMatcher("/css/**"), new AntPathRequestMatcher("/js/**"), new AntPathRequestMatcher("/imagenes/**")).permitAll().anyRequest().authenticated()).addFilterBefore(new JwtFiltroAutenticacion(jwt_util), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource()
    {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:9090", "http://127.0.0.1:9090"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public UserDetailsService userDetailsService()
    {
        //Bean vacio para que springboot no autoconfigure el suyo
        return new InMemoryUserDetailsManager();
    }
}