'use client';

import { useEffect } from 'react';

export default function LegacyEnhancements() {
  useEffect(() => {
    const menu = document.querySelector('.mobile-menu');
    const links = document.querySelector('.links');
    const closeMenu = () => {
      links?.classList.remove('open');
      menu?.setAttribute('aria-expanded', 'false');
      menu?.setAttribute('aria-label', 'Abrir menu');
      document.querySelectorAll('.nav-menu[open]').forEach((item) => item.removeAttribute('open'));
    };
    const toggleMenu = () => {
      const open = links?.classList.toggle('open');
      menu?.setAttribute('aria-expanded', String(open));
      menu?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    const outsideClick = (event) => {
      if (!event.target.closest('.header')) closeMenu();
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      const opened = document.querySelector('.nav-menu[open]');
      if (opened) {
        opened.removeAttribute('open');
        opened.querySelector('summary')?.focus();
      } else if (links?.classList.contains('open')) {
        closeMenu();
        menu?.focus();
      }
    };
    const closeOnLink = () => closeMenu();
    const closeOtherDetails = (event) => {
      if (event.currentTarget.open) {
        document.querySelectorAll('.nav-menu').forEach((item) => {
          if (item !== event.currentTarget) item.open = false;
        });
      }
    };
    const handleForm = async (event) => {
      const form = event.currentTarget;
      event.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      const data = new FormData(form);
      const fields = {};
      data.forEach((value, key) => {
        if (String(value).trim()) fields[key] = String(value).trim();
      });
      const status = form.querySelector('[data-form-status]');
      const button = form.querySelector('button[type="submit"]');
      if (status) status.textContent = 'Enviando sua solicitação de forma segura.';
      if (button) button.disabled = true;
      try {
        const response = await fetch('/api/mail.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ form: form.dataset.formKind, fields }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'Não foi possível enviar agora.');
        form.reset();
        if (status) status.textContent = result.message || 'Solicitação enviada com sucesso.';
      } catch (error) {
        if (status) status.textContent = error.message || 'Não foi possível enviar agora. Tente novamente mais tarde.';
      } finally {
        if (button) button.disabled = false;
      }
    };

    menu?.addEventListener('click', toggleMenu);
    document.addEventListener('click', outsideClick);
    document.addEventListener('keydown', onKeyDown);
    const anchors = [...(links?.querySelectorAll('a') || [])];
    const details = [...document.querySelectorAll('.nav-menu')];
    const forms = [...document.querySelectorAll('[data-mail-form]')];
    anchors.forEach((item) => item.addEventListener('click', closeOnLink));
    details.forEach((item) => item.addEventListener('toggle', closeOtherDetails));
    forms.forEach((item) => item.addEventListener('submit', handleForm));
    document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });

    return () => {
      menu?.removeEventListener('click', toggleMenu);
      document.removeEventListener('click', outsideClick);
      document.removeEventListener('keydown', onKeyDown);
      anchors.forEach((item) => item.removeEventListener('click', closeOnLink));
      details.forEach((item) => item.removeEventListener('toggle', closeOtherDetails));
      forms.forEach((item) => item.removeEventListener('submit', handleForm));
    };
  }, []);

  return null;
}
