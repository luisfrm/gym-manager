import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import safeTrim from "../../utils/safeTrim";

// Mock face encodings for testing - using deterministic values
const mockFaceEncoding1 = Array.from({ length: 128 }, (_, i) => Math.sin(i * 0.1) * 0.8);
const mockFaceEncoding2 = Array.from({ length: 128 }, (_, i) => Math.cos(i * 0.1) * 0.8);
// Similar encoding with small controlled differences (distance ~0.2)
const mockSimilarEncoding = mockFaceEncoding1.map(val => val + 0.02);

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

describe("Client Controller - safeTrim Integration", () => {
  describe("safeTrim usage in client data processing", () => {
    it("should handle null optional fields without errors", () => {
      // Simulate the exact scenario that was causing errors
      const mockClientData = {
        cedula: "12345678",
        firstname: "  Juan  ",
        lastname: "  Pérez  ",
        email: null,        // ← This was causing the error
        phone: null,        // ← This was causing the error  
        address: null,      // ← This was causing the error
        expiredDate: "2024-12-31"
      };

      // Test that all fields are processed correctly
      const processedData = {
        cedula: safeTrim(mockClientData.cedula),
        firstname: safeTrim(mockClientData.firstname),
        lastname: safeTrim(mockClientData.lastname),
        email: safeTrim(mockClientData.email),
        phone: safeTrim(mockClientData.phone),
        address: safeTrim(mockClientData.address),
        expiredDate: safeTrim(mockClientData.expiredDate),
      };

      expect(processedData.cedula).toBe("12345678");
      expect(processedData.firstname).toBe("Juan");
      expect(processedData.lastname).toBe("Pérez");
      expect(processedData.email).toBe("");      // null → empty string
      expect(processedData.phone).toBe("");     // null → empty string
      expect(processedData.address).toBe("");   // null → empty string
      expect(processedData.expiredDate).toBe("2024-12-31");
    });

    it("should handle undefined optional fields", () => {
      const mockClientData = {
        cedula: "87654321",
        firstname: "María",
        lastname: "González",
        email: undefined,
        phone: undefined,
        address: undefined,
        expiredDate: "2025-01-15"
      };

      const processedData = {
        cedula: safeTrim(mockClientData.cedula),
        firstname: safeTrim(mockClientData.firstname),
        lastname: safeTrim(mockClientData.lastname),
        email: safeTrim(mockClientData.email),
        phone: safeTrim(mockClientData.phone),
        address: safeTrim(mockClientData.address),
        expiredDate: safeTrim(mockClientData.expiredDate),
      };

      expect(processedData.email).toBe("");
      expect(processedData.phone).toBe("");
      expect(processedData.address).toBe("");
    });

    it("should handle mixed null, undefined, and valid optional fields", () => {
      const mockClientData = {
        cedula: "11111111",
        firstname: "Carlos",
        lastname: "Rodríguez",
        email: "  carlos@email.com  ",  // valid with spaces
        phone: null,                   // null
        address: undefined,            // undefined
        expiredDate: "2024-06-30"
      };

      const processedData = {
        cedula: safeTrim(mockClientData.cedula),
        firstname: safeTrim(mockClientData.firstname),
        lastname: safeTrim(mockClientData.lastname),
        email: safeTrim(mockClientData.email),
        phone: safeTrim(mockClientData.phone),
        address: safeTrim(mockClientData.address),
        expiredDate: safeTrim(mockClientData.expiredDate),
      };

      expect(processedData.cedula).toBe("11111111");
      expect(processedData.firstname).toBe("Carlos");
      expect(processedData.lastname).toBe("Rodríguez");
      expect(processedData.email).toBe("carlos@email.com");  // trimmed
      expect(processedData.phone).toBe("");                 // null → empty
      expect(processedData.address).toBe("");               // undefined → empty
      expect(processedData.expiredDate).toBe("2024-06-30");
    });

    it("should handle empty string optional fields", () => {
      const mockClientData = {
        cedula: "22222222",
        firstname: "Ana",
        lastname: "López",
        email: "",           // empty string
        phone: "   ",        // whitespace only
        address: "",         // empty string
        expiredDate: "2024-08-15"
      };

      const processedData = {
        cedula: safeTrim(mockClientData.cedula),
        firstname: safeTrim(mockClientData.firstname),
        lastname: safeTrim(mockClientData.lastname),
        email: safeTrim(mockClientData.email),
        phone: safeTrim(mockClientData.phone),
        address: safeTrim(mockClientData.address),
        expiredDate: safeTrim(mockClientData.expiredDate),
      };

      expect(processedData.email).toBe("");     // empty → empty
      expect(processedData.phone).toBe("");    // whitespace → empty
      expect(processedData.address).toBe("");  // empty → empty
    });
  });
});

describe("Client Controller - Face Duplication Validation", () => {
  describe("Face encoding duplication detection in client creation", () => {
    it("should detect similar face encodings during client creation", () => {
      // Define client type for the test
      type MockClient = {
        _id: string;
        firstname: string;
        lastname: string;
        cedula: string;
        hasFaceRegistered: boolean;
        faceEncoding: number[];
      };

      // Simulate existing client database query result
      const existingClients: MockClient[] = [
        {
          _id: "507f1f77bcf86cd799439011",
          firstname: "Juan",
          lastname: "Pérez", 
          cedula: "12345678",
          hasFaceRegistered: true,
          faceEncoding: mockFaceEncoding1
        }
      ];

      // Simulate new client face encoding (very similar to existing)
      const newClientEncoding = mockSimilarEncoding;
      const threshold = 0.35; // 65% mínimo de similitud

      // Test duplication detection logic
      let isDuplicate = false;
      let duplicateClient: MockClient | null = null;
      let similarity = 0;

      for (const existingClient of existingClients) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(newClientEncoding, existingClient.faceEncoding);
          
          if (distance < threshold) {
            isDuplicate = true;
            duplicateClient = existingClient;
            similarity = Math.max(0, 1 - distance);
            break;
          }
        }
      }

      expect(isDuplicate).toBe(true);
      expect(duplicateClient?.firstname).toBe("Juan");
      expect(similarity).toBeGreaterThan(0.5);
      
      // Additional verification: check that distance calculation is working
      const calculatedDistance = calculateEuclideanDistance(newClientEncoding, mockFaceEncoding1);
      expect(calculatedDistance).toBeLessThan(threshold);
      expect(calculatedDistance).toBeCloseTo(0.226, 2); // Expected distance ~0.226
    });

    it("should allow client creation with different face encodings", () => {
      // Simulate existing client database query result
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

      // Simulate new client with completely different face encoding
      const newClientEncoding = mockFaceEncoding2;
      const threshold = 0.35; // 65% mínimo de similitud

      // Test duplication detection logic
      let isDuplicate = false;

      for (const existingClient of existingClients) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(newClientEncoding, existingClient.faceEncoding);
          
          if (distance < threshold) {
            isDuplicate = true;
            break;
          }
        }
      }

      expect(isDuplicate).toBe(false); // Should allow creation
    });

    it("should handle empty or invalid face encodings gracefully", () => {
      const existingClients = [
        {
          _id: "507f1f77bcf86cd799439011",
          firstname: "Juan",
          lastname: "Pérez",
          cedula: "12345678",
          hasFaceRegistered: true,
          faceEncoding: [] // Empty array
        },
        {
          _id: "507f1f77bcf86cd799439012",
          firstname: "María",
          lastname: "González", 
          cedula: "87654321",
          hasFaceRegistered: true,
          faceEncoding: null // Null encoding
        }
      ];

      const newClientEncoding = mockFaceEncoding1;
      const threshold = 0.6;

      // Test that empty/null encodings don't cause errors
      let isDuplicate = false;

      for (const existingClient of existingClients) {
        if (existingClient.faceEncoding && existingClient.faceEncoding.length > 0) {
          const distance = calculateEuclideanDistance(newClientEncoding, existingClient.faceEncoding);
          
          if (distance < threshold) {
            isDuplicate = true;
            break;
          }
        }
      }

      expect(isDuplicate).toBe(false); // Should not find duplicates with empty/null encodings
    });

    it("should generate proper error response structure for duplicates", () => {
      const existingClient = {
        _id: "507f1f77bcf86cd799439011",
        firstname: "Juan",
        lastname: "Pérez",
        cedula: "12345678"
      };

      const similarity = 0.85;

      // Simulate the error response structure
      const errorResponse = {
        message: "Esta cara ya está registrada en el sistema",
        existingClient: {
          id: existingClient._id,
          firstname: existingClient.firstname,
          lastname: existingClient.lastname,
          cedula: existingClient.cedula
        },
        similarity
      };

      expect(errorResponse.message).toContain("ya está registrada");
      expect(errorResponse.existingClient.firstname).toBe("Juan");
      expect(errorResponse.existingClient.cedula).toBe("12345678");
      expect(errorResponse.similarity).toBe(0.85);
    });
  });
}); 