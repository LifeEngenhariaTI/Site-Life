# Implantação do canal de e-mail na UOL

Copie o conteúdo desta pasta para a raiz pública da hospedagem UOL que atende `life.eng.br`:

- `.htaccess` deve ficar na raiz do site para aplicar os cabeçalhos de segurança no Apache.
- `api/mail.php` deve ficar em `api/mail.php` para receber os formulários de Privacidade e Transparência.

O plano de hospedagem deve ter PHP com `mail()` habilitado e o remetente
`no-reply@life.eng.br` autorizado no domínio. Após copiar, teste os dois
formulários em HTTPS. Não envie a pasta `deploy` nem arquivos PHP para a
pasta `public` de uma implantação Node/Next.js.
