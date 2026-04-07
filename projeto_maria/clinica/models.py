from django.db import models
from django.contrib.auth.models import User

class Clinica(models.Model):
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=18, unique=True)
    endereco = models.TextField()

    def __str__(self):
        return self.nome

class Consultorio(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    numero_sala = models.CharField(max_length=10)
    equipamentos = models.TextField(blank=True, help_text="Ex: Lâmpada de Fenda, Refrator, etc.")

    def __str__(self):
        return f"Sala {self.numero_sala} - {self.clinica.nome}"

class Funcionario(models.Model):
    # Definindo os níveis de acesso
    NIVEIS_ACESSO = (
        ('ADMIN', 'Administrador'),
        ('MEDICO', 'Médico Oftalmologista'),
        ('RECEP', 'Recepção'),
    )
    
    # O OneToOneField liga este funcionário ao sistema de Login nativo do Django
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    cargo = models.CharField(max_length=10, choices=NIVEIS_ACESSO)
    crm = models.CharField(max_length=20, blank=True, null=True, help_text="Preencher apenas para médicos")

    def __str__(self):
        return f"{self.usuario.first_name} ({self.get_cargo_display()})"

class Paciente(models.Model):
    nome_completo = models.CharField(max_length=200)
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20)
    data_nascimento = models.DateField()

    def __str__(self):
        return self.nome_completo

class Agendamento(models.Model):
    STATUS_CHOICES = (
        ('AGENDADO', 'Agendado'),
        ('CONFIRMADO', 'Confirmado'),
        ('ATENDIDO', 'Atendido'),
        ('CANCELADO', 'Cancelado'),
    )
    
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    medico = models.ForeignKey(Funcionario, on_delete=models.CASCADE, limit_choices_to={'cargo': 'MEDICO'})
    consultorio = models.ForeignKey(Consultorio, on_delete=models.CASCADE)
    data_hora = models.DateTimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AGENDADO')
    observacoes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.paciente.nome_completo} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}"