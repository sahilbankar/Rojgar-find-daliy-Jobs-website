const mongoose = require('mongoose');
const Job = require('../models/Job');
const Category = require('../models/Category');

class JobService {
  /**
   * Resolve Category ObjectId safely from ID, name, or slug
   */
  async resolveCategory(categoryIdOrName) {
    if (!categoryIdOrName) return null;

    let catId = categoryIdOrName;
    if (catId && typeof catId === 'object' && catId._id) {
      catId = catId._id;
    }

    let catDoc = null;
    if (mongoose.Types.ObjectId.isValid(catId)) {
      catDoc = await Category.findById(catId);
    }

    if (!catDoc) {
      const catStr = String(catId).trim();
      catDoc = await Category.findOne({
        $or: [
          { name: new RegExp('^' + catStr + '$', 'i') },
          { slug: catStr.toLowerCase() }
        ]
      });

      if (!catDoc) {
        const formattedName = catStr.charAt(0).toUpperCase() + catStr.slice(1);
        const formattedSlug = catStr.toLowerCase().replace(/\s+/g, '-');
        catDoc = await Category.create({ name: formattedName, slug: formattedSlug });
      }
    }

    return catDoc;
  }

  /**
   * Create a new job
   */
  async createJob(jobData) {
    if (jobData.categoryId) {
      const catDoc = await this.resolveCategory(jobData.categoryId);
      if (catDoc) {
        jobData.categoryId = catDoc._id;
        jobData.category = catDoc.name;
      }
    }

    if (jobData.minSalary !== undefined) {
      jobData.salaryMin = Number(jobData.minSalary) || 0;
    }
    if (jobData.maxSalary !== undefined) {
      jobData.salaryMax = Number(jobData.maxSalary) || 0;
    }

    jobData.adminStatus = jobData.adminStatus || 'Approved';
    jobData.isActive = jobData.isActive !== undefined ? jobData.isActive : true;

    return Job.create(jobData);
  }

  /**
   * Get all jobs with filters, pagination, and sorting
   */
  async getJobs(query = {}) {
    const mongoQuery = {};

    const searchTerm = query.keyword || query.q;
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      mongoQuery.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    if (query.location) {
      mongoQuery.location = new RegExp(query.location.trim(), 'i');
    }

    if (query.jobType && query.jobType !== 'All') {
      mongoQuery.jobType = new RegExp(query.jobType.trim(), 'i');
    }

    if (query.category && query.category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(query.category)) {
        mongoQuery.categoryId = query.category;
      } else {
        mongoQuery.category = new RegExp(query.category.trim(), 'i');
      }
    }

    if (query.categoryId) {
      mongoQuery.categoryId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      mongoQuery.isActive = query.isActive === 'true' || query.isActive === true;
    } else {
      mongoQuery.isActive = true;
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(mongoQuery);
    const jobs = await Job.find(mongoQuery)
      .populate('employerId', 'companyName logoUrl')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return { jobs, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Get single job by ID
   */
  async getJobById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Job.findById(id)
      .populate('employerId', 'companyName logoUrl location companyDescription')
      .populate('categoryId', 'name slug')
      .populate('applications');
  }

  /**
   * Update job by ID
   */
  async updateJob(id, updateData) {
    if (updateData.categoryId) {
      const catDoc = await this.resolveCategory(updateData.categoryId);
      if (catDoc) {
        updateData.categoryId = catDoc._id;
        updateData.category = catDoc.name;
      }
    }

    return Job.findByIdAndUpdate(id, updateData, {
      new: true,
      returnDocument: 'after',
      runValidators: true
    });
  }

  /**
   * Delete job by ID
   */
  async deleteJob(id) {
    return Job.findByIdAndDelete(id);
  }
}

module.exports = new JobService();
