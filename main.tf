variable "gym_manager_namespace" {
  description = "The namespace for the gym manager"
  type        = string
  default     = "gym-manager"
}

variable "backend_deployment_name" {
  description = "The name of the backend deployment"
  type        = string
  default     = "gym-manager-backend"
}

variable "frontend_deployment_name" {
  description = "The name of the frontend deployment"
  type        = string
  default     = "gym-manager-frontend"
}

variable "backend_service_name" {
  description = "The name of the backend service"
  type        = string
  default     = "gym-manager-backend"
}

variable "frontend_service_name" {
  description = "The name of the frontend service"
  type        = string
  default     = "gym-manager-frontend"
}

variable "frontend_image" {
  description = "The image for the frontend"
  type        = string
  default     = "luisfrm/gym-manager-frontend:latest"
}

variable "backend_image" {
  description = "The image for the backend"
  type        = string
  default     = "luisfrm/gym-manager-backend:latest"
}

variable "frontend_repository" {
  description = "The repository for the frontend"
  type        = string
  default     = "gym-manager-frontend"
}

variable "backend_repository" {
  description = "The repository for the backend"
  type        = string
  default     = "gym-manager-backend"
}

provider "kubernetes" {
  config_path = "~/.kube/config" # This is the path to the kubeconfig file
}

resource "kubernetes_namespace" "gym_manager" {
  metadata {
    name = var.gym_manager_namespace
  }
}

resource "kubernetes_deployment" "gym_manager_backend" {
  metadata {
    name      = var.backend_deployment_name
    namespace = var.gym_manager_namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = var.backend_deployment_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.backend_deployment_name
        }
      }

      spec {
        container {
          name  = var.backend_deployment_name
          image = var.backend_image

          port {
            container_port = 3000 # Default port for backend
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "gym_manager_frontend" {
  metadata {
    name      = var.frontend_deployment_name
    namespace = var.gym_manager_namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = var.frontend_deployment_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.frontend_deployment_name
        }
      }

      spec {
        container {
          name  = var.frontend_deployment_name
          image = var.frontend_image

          port {
            container_port = 80 # Default port for nginx
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "gym_manager_backend" {
  metadata {
    name      = var.backend_service_name
    namespace = var.gym_manager_namespace
  }

  spec {
    selector = {
      app = var.backend_deployment_name
    }

    port {
      port        = 3000 # This is the port that the service will listen on
      target_port = 3000 # This is the port that the backend will listen on
    }

    type = "NodePort"
  }
}

resource "kubernetes_service" "gym_manager_frontend" {
  metadata {
    name      = var.frontend_service_name
    namespace = var.gym_manager_namespace
  }

  spec {
    selector = {
      app = var.frontend_deployment_name
    }

    port {
      port        = 80 # This is the port that the service will listen on
      target_port = 80 # This is the port that the frontend will listen on
    }

    type = "NodePort"
  }
}


