import Faculty from "../models/facultySchema.js";
import SystemConfig from "../models/systemConfigSchema.js";

export async function getFacultyDetails(req, res) {
  try {
    const { employeeId } = req.params;

    const faculty = await Faculty.findOne({ employeeId: employeeId });

    if (!faculty) {
      return res
        .status(404)
        .json({ message: "no faculty found with the provided ID" });
    }

    return res.status(200).json({
      success: true,
      message: "Operation successful",
      data: faculty,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getDefaultDeadline(req, res) {
  try {
    const config = await SystemConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: "No default deadlines set yet." });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}