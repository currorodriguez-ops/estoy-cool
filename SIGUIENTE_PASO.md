# Qué hice mientras no estabas

## Archivos creados/modificados:
- `app/login/page.tsx` — Página de inicio de sesión
- `app/registro/page.tsx` — Página de registro para nuevos pacientes
- `app/chat/page.tsx` — Actualizado para usar usuario real (no el de prueba)
- `app/psicologo/page.tsx` — Actualizado con verificación de acceso y logout
- `app/page.tsx` — Ahora redirige al login automáticamente
- `middleware.ts` — Protege las rutas /chat y /psicologo (requieren login)

## Lo primero que debes hacer cuando vuelvas:

### 1. Instalar dependencia nueva (en la terminal de VS Code):
```
npm install @supabase/ssr
```

### 2. Configurar Supabase Auth
En el panel de Supabase → Authentication → Settings:
- Desactiva "Confirm email" para que no pida verificar email en pruebas
- (Luego lo volvemos a activar para producción)

### 3. Crear tu psicólogo de prueba
En Supabase → SQL Editor:
```sql
insert into psicologos (nombre, email)
values ('Dr. Prueba', 'psicologo@estoycool.com');
```

### 4. Probar el flujo completo
- Ve a http://localhost:3000 → debe redirigir al login
- Regístrate como paciente nuevo
- Prueba el chat
- Cierra sesión
- Entra con psicologo@estoycool.com (después de crear cuenta en /registro con ese email)
- Verifica que entra al panel del psicólogo

## Pendiente para después:
- [ ] Asociar pacientes a su psicólogo específico
- [ ] Deploy en Vercel
