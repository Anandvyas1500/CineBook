const City = require('../models/City');
const Theatre = require('../models/Theatre');
const { AppError, asyncHandler } = require('../middleware/errorMiddleware');

const DEFAULT_CITIES = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'];

// @desc    Get all active cities with live theatre counts
// @route   GET /api/cities
// @access  Public
const getCities = asyncHandler(async (req, res) => {
  // 1. Fetch all managed active cities
  const dbCities = await City.find({ isActive: true }).sort('name');
  const cityMap = new Map();

  // 2. Fetch live theatre counts grouped by city
  const theatreCounts = await Theatre.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$city', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  theatreCounts.forEach((r) => {
    if (r._id) {
      countMap[r._id.toLowerCase()] = { name: r._id, count: r.count };
    }
  });

  // 3. Collect deactivated city names to respect admin deletions
  const deactivatedCities = await City.find({ isActive: false }).distinct('name');
  const deactivatedSet = new Set(deactivatedCities.map((n) => n.toLowerCase()));

  // Add explicit active cities from City collection
  dbCities.forEach((c) => {
    const key = c.name.toLowerCase();
    cityMap.set(key, {
      _id: c._id,
      name: c.name,
      slug: c.slug || key.replace(/[^a-z0-9]+/g, '-'),
      state: c.state || '',
      theatresCount: countMap[key]?.count || 0
    });
  });

  // Add any cities that have active theatres (unless explicitly deactivated)
  Object.keys(countMap).forEach((key) => {
    if (!deactivatedSet.has(key)) {
      if (cityMap.has(key)) {
        cityMap.get(key).theatresCount = countMap[key].count;
      } else {
        const originalName = countMap[key].name;
        cityMap.set(key, {
          _id: `theatre-${key}`,
          name: originalName,
          slug: key.replace(/[^a-z0-9]+/g, '-'),
          state: '',
          theatresCount: countMap[key].count
        });
      }
    }
  });

  // Ensure default core cities are present (unless explicitly deactivated)
  DEFAULT_CITIES.forEach((cityName) => {
    const key = cityName.toLowerCase();
    if (!deactivatedSet.has(key) && !cityMap.has(key)) {
      cityMap.set(key, {
        _id: `default-${key}`,
        name: cityName,
        slug: key.replace(/[^a-z0-9]+/g, '-'),
        state: '',
        theatresCount: countMap[key]?.count || 0
      });
    }
  });

  const cityDetails = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({
    success: true,
    cities: cityDetails.map((c) => c.name),
    cityDetails
  });
});

// @desc    Create a new city
// @route   POST /api/admin/cities
// @access  Private / Admin
const createCity = asyncHandler(async (req, res, next) => {
  const { name, state } = req.body;
  if (!name || !name.trim()) {
    return next(new AppError('City name is required', 400));
  }

  const trimmed = name.trim();
  const existing = await City.findOne({ name: new RegExp(`^${trimmed}$`, 'i') });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      if (state) existing.state = state.trim();
      await existing.save();
      return res.status(200).json({ success: true, message: 'City reactivated successfully', city: existing });
    }
    return next(new AppError(`City "${trimmed}" already exists`, 409));
  }

  const city = await City.create({ name: trimmed, state: (state || '').trim() });
  res.status(201).json({ success: true, message: 'City added successfully', city });
});

// @desc    Update a city
// @route   PUT /api/admin/cities/:id
// @access  Private / Admin
const updateCity = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.id);
  if (!city) return next(new AppError('City not found', 404));

  const { name, state, isActive } = req.body;
  if (name !== undefined) city.name = name.trim();
  if (state !== undefined) city.state = state.trim();
  if (isActive !== undefined) city.isActive = isActive;

  await city.save();
  res.status(200).json({ success: true, message: 'City updated successfully', city });
});

// @desc    Delete (deactivate) a city
// @route   DELETE /api/admin/cities/:id
// @access  Private / Admin
const deleteCity = asyncHandler(async (req, res, next) => {
  const city = await City.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!city) return next(new AppError('City not found', 404));
  res.status(200).json({ success: true, message: 'City deactivated successfully' });
});

module.exports = { getCities, createCity, updateCity, deleteCity };
