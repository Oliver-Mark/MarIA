from django.shortcuts import render

def pagina_login(request):
    # Por enquanto, essa função apenas renderiza o seu HTML na tela.
    # Mais para frente, colocaremos aqui a lógica de validar usuário e senha!
    return render(request, 'clinica/login.html')

def pagina_selecao(request):
    return render(request, 'clinica/selecao.html')