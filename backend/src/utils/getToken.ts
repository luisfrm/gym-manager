const getToken = (req: any): string | null => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null; // Return null if there is no valid token
  }

  // Extract the token after 'Bearer '
  return authHeader.split(" ")[1];
};

export default getToken;
