describe('Testes de Configurações - MarIA', () => {
  
  it('Deve ativar o modo escuro e salvar no LocalStorage', () => {
    // 1. O robô acessa a tela de configurações
    cy.visit('/configuracoes.html');

    // 2. Ele clica na aba de Aparência e Acessibilidade
    cy.contains('Aparência e Acessibilidade').click();

    // 3. Ele clica no toggle (interruptor) do Tema Escuro
    cy.get('#toggle-tema').click({ force: true });

    // 4. Ele verifica se a cor da tela mudou em tempo real
    cy.get('body').should('have.class', 'dark-theme');

    // 5. Ele clica em "Salvar alterações" e verifica o LocalStorage
    cy.get('#aparencia .btn-salvar').click();
    cy.window().then((window) => {
      const config = JSON.parse(window.localStorage.getItem('maria_config'));
      expect(config.temaEscuro).to.be.true;
    });
  });
});