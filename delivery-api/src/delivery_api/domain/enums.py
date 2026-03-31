from enum import Enum


class OrderStatus(str, Enum):
    RECEBIDO = "recebido"
    A_CAMINHO = "a_caminho"
    ENTREGUE = "entregue"

