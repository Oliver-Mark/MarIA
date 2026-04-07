from django.contrib import admin
from .models import Clinica, Consultorio, Funcionario, Paciente, Agendamento

# Aqui estamos registrando nossas tabelas para aparecerem no painel
admin.site.register(Clinica)
admin.site.register(Consultorio)
admin.site.register(Funcionario)
admin.site.register(Paciente)
admin.site.register(Agendamento)