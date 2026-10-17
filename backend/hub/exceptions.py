from rest_framework.exceptions import APIException


class StateConflict(APIException):
    status_code = 409
    default_detail = "A operação conflita com o estado atual do recurso."
    default_code = "state_conflict"
