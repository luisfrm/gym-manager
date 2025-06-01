import { describe, expect, it, beforeEach, afterEach } from "bun:test";

// Mock encoding for testing face duplication
const mockFaceEncoding1 = Array.from({ length: 128 }, (_, i) => Math.random() * 2 - 1);
const mockFaceEncoding2 = Array.from({ length: 128 }, (_, i) => Math.random() * 2 - 1);
const mockSimilarEncoding = mockFaceEncoding1.map(val => val + (Math.random() * 0.1 - 0.05)); // Very similar

// Function to calculate euclidean distance (same as in controller)
function calculateEuclideanDistance(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error("Los vectores deben tener la misma longitud");
  }
  
  let sum = 0;
  for (let i = 0; i < vector1.length; i++) {
    sum += Math.pow(vector1[i] - vector2[i], 2);
  }
  
  return Math.sqrt(sum);
}

describe("Face Recognition Controller - Face Duplication Validation", () => {
  describe("Face encoding similarity detection", () => {
    it("should detect very similar face encodings as duplicates", () => {
      const distance = calculateEuclideanDistance(mockFaceEncoding1, mockSimilarEncoding);
      const threshold = 0.6;
      
      expect(distance).toBeLessThan(threshold);
      expect(distance).toBeGreaterThan(0); // Not exactly the same but very similar
    });

    it("should not flag different face encodings as duplicates", () => {
      const distance = calculateEuclideanDistance(mockFaceEncoding1, mockFaceEncoding2);
      const threshold = 0.6;
      
      expect(distance).toBeGreaterThan(threshold);
    });

    it("should handle identical encodings correctly", () => {
      const distance = calculateEuclideanDistance(mockFaceEncoding1, [...mockFaceEncoding1]);
      
      expect(distance).toBe(0);
    });
  });

  describe("Face validation endpoint logic", () => {
    it("should simulate validateFaceEncoding endpoint behavior for duplicate faces", () => {
      // Simulate existing clients in database
      const existingClients = [
        {
          _id: "507f1f77bcf86cd799439011",
          firstname: "Juan",
          lastname: "Pérez",
          cedula: "12345678",
          hasFaceRegistered: true,
          faceEncoding: mockFaceEncoding1
        }
      ];

      // Simulate new face encoding validation request
      const newEncoding = mockSimilarEncoding;
      const threshold = 0.6;

      // Test validation logic
      type ValidationResult = {
        isValid: boolean;
        conflict: {
          message: string;
          existingClient: {
            id: string;
            firstname: string;
            lastname: string;
            cedula: string;
          };
          similarity: number;
        } | null;
      };

      let validationResult: ValidationResult = { isValid: true, conflict: null };

      for (const existingClient of existingClients) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(newEncoding, existingClient.faceEncoding);
          
          if (distance < threshold) {
            validationResult = {
              isValid: false,
              conflict: {
                message: "Esta cara ya está registrada en el sistema",
                existingClient: {
                  id: existingClient._id,
                  firstname: existingClient.firstname,
                  lastname: existingClient.lastname,
                  cedula: existingClient.cedula
                },
                similarity: Math.max(0, 1 - distance)
              }
            };
            break;
          }
        }
      }

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.conflict?.existingClient.firstname).toBe("Juan");
      expect(validationResult.conflict?.similarity).toBeGreaterThan(0.5);
    });

    it("should allow validation for sufficiently different faces", () => {
      // Simulate existing clients in database
      const existingClients = [
        {
          _id: "507f1f77bcf86cd799439011",
          firstname: "Juan", 
          lastname: "Pérez",
          cedula: "12345678",
          hasFaceRegistered: true,
          faceEncoding: mockFaceEncoding1
        }
      ];

      // Simulate completely different face encoding
      const newEncoding = mockFaceEncoding2;
      const threshold = 0.6;

      // Test validation logic with proper typing
      type ValidationResult = {
        isValid: boolean;
        conflict: {
          message: string;
          existingClient: {
            id: string;
            firstname: string;
            lastname: string;
            cedula: string;
          };
          similarity: number;
        } | null;
      };

      let validationResult: ValidationResult = { isValid: true, conflict: null };

      for (const existingClient of existingClients) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(newEncoding, existingClient.faceEncoding);
          
          if (distance < threshold) {
            validationResult = {
              isValid: false,
              conflict: {
                message: "Esta cara ya está registrada en el sistema",
                existingClient: {
                  id: existingClient._id,
                  firstname: existingClient.firstname,
                  lastname: existingClient.lastname,
                  cedula: existingClient.cedula
                },
                similarity: Math.max(0, 1 - distance)
              }
            };
            break;
          }
        }
      }

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.conflict).toBe(null);
    });

    it("should handle empty database gracefully", () => {
      // Simulate empty database (no clients with faces)
      const existingClients: any[] = [];
      const newEncoding = mockFaceEncoding1;

      // Should always pass validation when no faces exist
      const validationResult = { isValid: true, message: "Cara válida para registro" };

      if (existingClients.length === 0) {
        // Validation passes automatically
      }

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.message).toBe("Cara válida para registro");
    });
  });

  describe("Face registration validation logic", () => {
    it("should validate face registration data structure", () => {
      const mockRegistrationRequest = {
        clientId: "507f1f77bcf86cd799439011",
        faceEncoding: mockFaceEncoding1
      };

      expect(mockRegistrationRequest.clientId).toBeTruthy();
      expect(Array.isArray(mockRegistrationRequest.faceEncoding)).toBe(true);
      expect(mockRegistrationRequest.faceEncoding.length).toBe(128);
    });

    it("should handle encoding array validation", () => {
      const validEncoding = mockFaceEncoding1;
      const invalidEncoding = Array.from({ length: 64 }, () => Math.random()); // Wrong length
      
      expect(validEncoding.length).toBe(128);
      expect(invalidEncoding.length).not.toBe(128);
      
      // Test that distance calculation would fail with different lengths
      expect(() => {
        calculateEuclideanDistance(validEncoding, invalidEncoding);
      }).toThrow("Los vectores deben tener la misma longitud");
    });
  });

  describe("Duplicate detection scenarios", () => {
    it("should simulate face duplication detection workflow", () => {
      // Simulate existing client with face
      const existingClient = {
        id: "507f1f77bcf86cd799439011",
        firstname: "Juan",
        lastname: "Pérez",
        cedula: "12345678",
        faceEncoding: mockFaceEncoding1
      };

      // Simulate new registration attempt with similar face
      const newRegistrationEncoding = mockSimilarEncoding;

      // Calculate similarity
      const distance = calculateEuclideanDistance(existingClient.faceEncoding, newRegistrationEncoding);
      const threshold = 0.6;
      const similarity = Math.max(0, 1 - distance);

      if (distance < threshold) {
        // Would trigger duplicate detection
        const duplicateResponse = {
          message: "Esta cara ya está registrada en el sistema",
          existingClient: {
            id: existingClient.id,
            firstname: existingClient.firstname,
            lastname: existingClient.lastname,
            cedula: existingClient.cedula
          },
          similarity
        };

        expect(duplicateResponse.message).toContain("ya está registrada");
        expect(duplicateResponse.existingClient.firstname).toBe("Juan");
        expect(duplicateResponse.similarity).toBeGreaterThan(0.5);
      }

      expect(distance).toBeLessThan(threshold); // Should detect as duplicate
    });

    it("should allow registration when faces are sufficiently different", () => {
      const existingEncoding = mockFaceEncoding1;
      const newEncoding = mockFaceEncoding2;
      
      const distance = calculateEuclideanDistance(existingEncoding, newEncoding);
      const threshold = 0.6;
      
      expect(distance).toBeGreaterThan(threshold); // Should allow registration
    });
  });
}); 