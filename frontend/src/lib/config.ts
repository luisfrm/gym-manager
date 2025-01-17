export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";

export const TIME_TO_HIDE_ERROR = 3000;

export const ClientTableHeads = {
  cedula: {
    label: "Cedula",
    ClassNames: ""
  },
  firstname: {
    label: "Nombre",
    ClassNames: ""
  },
  lastname: {
    label: "Apellido",
    ClassNames: ""
  },
  email: {
    label: "Email",
    ClassNames: ""
  },
  phone: {
    label: "Telefono",
    ClassNames: ""
  },
  address: {
    label: "Direccion",
    ClassNames: ""
  },
  expiredDate: {
    label: "Fecha de vencimiento",
    ClassNames: ""
  },
  status: {
    label: "Estado",
    ClassNames: "text-right"
  },
  actions: {
    label: "Acciones",
    ClassNames: "text-right"
  }
}