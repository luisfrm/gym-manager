import Log from "../models/log.model";
import { AppRequest } from "../utils/types";

class LogController {
  static getAll = async (req: AppRequest, res: any) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const sortField = req.query.sortField as string || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const search = req.query.search as string || '';

    const startIndex = (page - 1) * limit;
    const logs = await Log
      .find({ message: { $regex: search, $options: 'i' } })
      .populate("user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ [sortField]: sortOrder });

    const total = await Log.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const response = {
      info: {
        total,
        pages: totalPages,
        next: page < totalPages ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}&limit=${limit}` : null,
      },
      results: logs,
    };
    res.status(200).json(response);
  };

  static getAllByUser = async (req: AppRequest, res: any) => {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const sortField = req.query.sortField as string || 'updatedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const startIndex = (page - 1) * limit;
    const logs = await Log
      .find({ user: user.userId })
      .populate("user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ [sortField]: sortOrder });

    const total = await Log.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const response = {
      info: {
        total,
        pages: totalPages,
        next: page < totalPages ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}&limit=${limit}` : null,
      },
      results: logs,
    };
    res.status(200).json(response);
  };
}

export default LogController;
