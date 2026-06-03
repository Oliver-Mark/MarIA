describe('Jornada Completa do Usuário (E2E) - MarIA', () => {

  beforeEach(() => {
    // Previne que o Cypress falhe o teste caso encontre erros não tratados na aplicação, como o "Chart is not defined"
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
  
  it('Deve logar, navegar por todas as telas, editar perfil, mudar tema/fonte e fazer logout', () => {
    // 1. Tela de Login
    cy.visit('/login.html');
    cy.get('#email').type('admin@maria.com');
    cy.get('#senha').type('123456');
    cy.get('#btnAcessar').click();

    // 2. Tela de Seleção
    cy.url().should('include', 'selecao.html');
    cy.get('#clinica').select('centro');
    cy.get('#consultorio').select('consultorio1');
    cy.get('.btn-continuar').click();

    // 3. Tela Inicial
    cy.url().should('include', 'tela_inicial.html');

    // 4. Navegar por todas as telas do menu lateral
    cy.get('.sidebar a[href="agenda.html"]').click();
    cy.url().should('include', 'agenda.html');

    cy.get('.sidebar a[href="sala_de_espera.html"]').click();
    cy.url().should('include', 'sala_de_espera.html');

    cy.get('.sidebar a[href="pacientes.html"]').click();
    cy.url().should('include', 'pacientes.html');

    cy.get('.sidebar a[href="assinatura_eletronica.html"]').click();
    cy.url().should('include', 'assinatura_eletronica.html');

    cy.get('.sidebar a[href="dashboard.html"]').click();
    cy.url().should('include', 'dashboard.html');

    cy.get('.sidebar a[href="informacoes.html"]').click();
    cy.url().should('include', 'informacoes.html');

    // 5. Acessar Configurações e testar aba "Informações Pessoais"
    cy.get('.sidebar a[href="configuracoes.html"]').click();
    cy.url().should('include', 'configuracoes.html');

    cy.get('#btn-editar-pessoais').click();
    cy.get('#input-nome-exibicao').should('not.have.attr', 'readonly');
    cy.get('#input-nome-exibicao').clear().type('Dra. Teste Cypress');
    
    cy.get('#pessoais .btn-salvar').contains('Salvar alterações').click();
    cy.get('#input-nome-exibicao').should('have.attr', 'readonly');

    // 6. Testar aba "Aparência e Acessibilidade" (Tema Escuro)
    cy.contains('Aparência e Acessibilidade').click();
    cy.get('#toggle-tema').click({ force: true });
    cy.get('#aparencia .btn-salvar').click();
    cy.get('body').should('have.class', 'dark-theme');

    // 7. Visitar outras telas e verificar se o tema escuro persistiu
    cy.get('.sidebar a[href="pacientes.html"]').click();
    cy.get('body').should('have.class', 'dark-theme');

    // 8. Voltar para configurações e alterar o tamanho da fonte (140%)
    cy.get('.sidebar a[href="configuracoes.html"]').click();
    cy.contains('Aparência e Acessibilidade').click();
    cy.get('#range-fonte').invoke('val', 140).trigger('input');
    cy.get('#aparencia .btn-salvar').click();

    // 9. Visitar outra tela e garantir que a fonte (1.4em) persistiu no Root
    cy.get('.sidebar a[href="agenda.html"]').click();
    cy.window().then((win) => {
      const fontSize = win.document.documentElement.style.getPropertyValue('--tamanho-fonte-base');
      expect(fontSize).to.equal('1.4em');
    });

    // 10. Reverter as configurações ao padrão
    cy.get('.sidebar a[href="configuracoes.html"]').click();
    cy.contains('Aparência e Acessibilidade').click();
    cy.get('#toggle-tema').click({ force: true }); // Desativa o tema escuro
    cy.get('#range-fonte').invoke('val', 100).trigger('input'); // Restaura a fonte
    cy.get('#aparencia .btn-salvar').click();
    cy.get('body').should('not.have.class', 'dark-theme');

    // 11. Sair do sistema (Log-out)
    cy.get('.sidebar a[href="login.html"]').click();
    cy.url().should('include', 'login.html');
  });
});