import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  Film,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  X,
  MapPin,
  Pencil,
  Star,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';
import { useToast, useConfirm } from '../../context/UiContext';
import { toLocalDateStr } from '../../utils/format';
import { adminService } from '../../services/adminService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import Loader from '../../components/common/Loader';

export const AdminDashboard = () => {
  // Access is enforced by <ProtectedRoute adminOnly> in App.jsx; the API also checks the role on every call.
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lists for managers
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // Modals state
  const [isAddMovieModal, setIsAddMovieModal] = useState(false);
  const [isEditMovieModal, setIsEditMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [savingMovie, setSavingMovie] = useState(false);
  const [editModalTab, setEditModalTab] = useState('general');
  const [editMovieForm, setEditMovieForm] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    duration: 150,
    releaseDate: '',
    rating: 8.5,
    votesCount: 0,
    certificate: 'UA',
    genre: '',
    language: '',
    formats: '',
    director: '',
    isFeatured: false,
    isActive: true,
    cast: []
  });

  // Movie catalog filtering
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [movieStatusFilter, setMovieStatusFilter] = useState('all');

  const [isAddTheatreModal, setIsAddTheatreModal] = useState(false);
  const [isScheduleShowModal, setIsScheduleShowModal] = useState(false);
  const [isAddCityModal, setIsAddCityModal] = useState(false);

  // New movie form
  const [newMovie, setNewMovie] = useState({
    title: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    duration: 150,
    genre: 'Action, Sci-Fi',
    language: 'English, Hindi',
    formats: 'IMAX, 2D',
    certificate: 'UA',
    rating: 8.5
  });

  // New theatre form
  const [newTheatre, setNewTheatre] = useState({
    name: '',
    city: '',
    address: '',
    location: '',
    amenities: 'Dolby Atmos, Recliners, Food Court'
  });

  // New city form
  const [newCity, setNewCity] = useState({ name: '', state: '' });

  // New show schedule form
  const [newShow, setNewShow] = useState({
    movie: '',
    theatre: '',
    screen: '',
    showDate: toLocalDateStr(),
    showTime: '06:00 PM',
    format: 'IMAX 3D',
    language: 'English',
    classicPrice: 180,
    premiumPrice: 280,
    vipPrice: 450
  });

  const [screensForSelectedTheatre, setScreensForSelectedTheatre] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, theatresRes, bookingsRes, citiesRes] = await Promise.all([
        adminService.getStats(),
        movieService.getMovies({ includeInactive: 'true' }),
        theatreService.getTheatres(),
        adminService.getAllBookings(),
        adminService.getCities()
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (moviesRes.movies) setMoviesList(moviesRes.movies);
      if (theatresRes.theatres) setTheatresList(theatresRes.theatres);
      if (bookingsRes.bookings) setAllBookings(bookingsRes.bookings);
      if (citiesRes.cityDetails) {
        setCitiesList(citiesRes.cityDetails);
        // Auto-select first city in the theatre form
        if (citiesRes.cityDetails.length > 0) {
          setNewTheatre((prev) => ({ ...prev, city: citiesRes.cityDetails[0].name }));
        }
      }

      // Pre-select first movie and theatre in show form
      if (moviesRes.movies?.length > 0 && theatresRes.theatres?.length > 0) {
        setNewShow((prev) => ({
          ...prev,
          movie: moviesRes.movies[0]._id,
          theatre: theatresRes.theatres[0]._id
        }));
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock background scroll when any modal is open
  const anyModalOpen = isAddMovieModal || isEditMovieModal || isAddTheatreModal || isAddCityModal;
  useEffect(() => {
    if (anyModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [anyModalOpen]);

  // When selected theatre in show scheduler changes, load its screens
  useEffect(() => {
    if (!newShow.theatre) return;
    const fetchScreens = async () => {
      try {
        const res = await theatreService.getTheatreById(newShow.theatre);
        if (res.screens && res.screens.length > 0) {
          setScreensForSelectedTheatre(res.screens);
          setNewShow((prev) => ({ ...prev, screen: res.screens[0]._id }));
        } else {
          setScreensForSelectedTheatre([]);
        }
      } catch (err) {
        console.error('Failed to load screens:', err);
      }
    };
    fetchScreens();
  }, [newShow.theatre]);

  if (loading) {
    return <Loader message="Aggregating Box Office Metrics & Admin Controls..." fullScreen />;
  }

  // Handle Add Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMovie,
        duration: Number(newMovie.duration),
        rating: Number(newMovie.rating),
        genre: newMovie.genre.split(',').map((s) => s.trim()),
        language: newMovie.language.split(',').map((s) => s.trim()),
        formats: newMovie.formats.split(',').map((s) => s.trim())
      };

      const res = await adminService.createMovie(payload);
      if (res.movie) {
        setMoviesList((prev) => [res.movie, ...prev]);
        setIsAddMovieModal(false);
        toast.success('Movie published.');
      }
    } catch (err) {
      toast.error(`Failed to add movie: ${err.message}`);
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (id) => {
    const ok = await confirm({
      title: 'Deactivate this movie?',
      message: 'It disappears from the site and its upcoming screenings are cancelled, with bookings refunded.',
      confirmLabel: 'Deactivate',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await adminService.deleteMovie(id);
      setMoviesList((prev) => prev.map((m) => (m._id === id ? { ...m, isActive: false } : m)));
      toast.success('Movie deactivated.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle active / reactivate movie
  const handleToggleActiveMovie = async (movie) => {
    const nextActive = !movie.isActive;
    if (!nextActive) {
      const ok = await confirm({
        title: `Deactivate "${movie.title}"?`,
        message: 'It disappears from public search and upcoming screenings.',
        confirmLabel: 'Deactivate',
        tone: 'danger'
      });
      if (!ok) return;
    }
    try {
      await adminService.updateMovie(movie._id, { isActive: nextActive });
      setMoviesList((prev) =>
        prev.map((m) => (m._id === movie._id ? { ...m, isActive: nextActive } : m))
      );
      toast.success(`"${movie.title}" ${nextActive ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Open Edit Movie Modal with prefilled values
  const handleOpenEditMovie = (movie) => {
    setEditingMovie(movie);
    let releaseDateStr = '';
    if (movie.releaseDate) {
      const d = new Date(movie.releaseDate);
      if (!Number.isNaN(d.getTime())) {
        releaseDateStr = toLocalDateStr(d);
      }
    }

    setEditMovieForm({
      title: movie.title || '',
      synopsis: movie.synopsis || '',
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      duration: movie.duration ?? 150,
      releaseDate: releaseDateStr,
      rating: movie.rating ?? 0,
      votesCount: movie.votesCount ?? 0,
      certificate: movie.certificate || 'UA',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
      language: Array.isArray(movie.language) ? movie.language.join(', ') : (movie.language || ''),
      formats: Array.isArray(movie.formats) ? movie.formats.join(', ') : (movie.formats || ''),
      director: movie.director || '',
      isFeatured: Boolean(movie.isFeatured),
      isActive: movie.isActive !== false,
      cast: Array.isArray(movie.cast)
        ? movie.cast.map((c) => ({
            name: c?.name || '',
            role: c?.role || '',
            avatar: c?.avatar || ''
          }))
        : []
    });
    setEditModalTab('general');
    setIsEditMovieModal(true);
  };

  // Handle Update Movie
  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    if (!editingMovie?._id) return;

    if (!editMovieForm.title.trim()) {
      toast.error('Movie title is required.');
      return;
    }
    if (!editMovieForm.synopsis.trim()) {
      toast.error('Movie synopsis is required.');
      return;
    }
    if (!editMovieForm.posterUrl.trim()) {
      toast.error('Poster URL is required.');
      return;
    }

    try {
      setSavingMovie(true);
      const payload = {
        title: editMovieForm.title.trim(),
        synopsis: editMovieForm.synopsis.trim(),
        posterUrl: editMovieForm.posterUrl.trim(),
        backdropUrl: editMovieForm.backdropUrl.trim(),
        trailerUrl: editMovieForm.trailerUrl.trim(),
        duration: Math.max(1, Number(editMovieForm.duration) || 1),
        rating: Math.min(10, Math.max(0, Number(editMovieForm.rating) || 0)),
        votesCount: Math.max(0, Number(editMovieForm.votesCount) || 0),
        certificate: editMovieForm.certificate,
        genre: editMovieForm.genre
          ? editMovieForm.genre.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        language: editMovieForm.language
          ? editMovieForm.language.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        formats: editMovieForm.formats
          ? editMovieForm.formats.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        director: editMovieForm.director.trim() || 'Unknown',
        releaseDate: editMovieForm.releaseDate ? new Date(editMovieForm.releaseDate) : null,
        isFeatured: Boolean(editMovieForm.isFeatured),
        isActive: Boolean(editMovieForm.isActive),
        cast: (editMovieForm.cast || [])
          .filter((c) => c && c.name && c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            role: (c.role || '').trim(),
            avatar: (c.avatar || '').trim()
          }))
      };

      const res = await adminService.updateMovie(editingMovie._id, payload);
      if (res.movie) {
        setMoviesList((prev) =>
          prev.map((m) => (m._id === editingMovie._id ? res.movie : m))
        );
        setIsEditMovieModal(false);
        setEditingMovie(null);
        toast.success(`"${res.movie.title}" updated successfully.`);
      }
    } catch (err) {
      toast.error(`Failed to update movie: ${err.message}`);
    } finally {
      setSavingMovie(false);
    }
  };

  // Cast row helpers
  const handleAddCastRow = () => {
    setEditMovieForm((prev) => ({
      ...prev,
      cast: [...prev.cast, { name: '', role: '', avatar: '' }]
    }));
  };

  const handleUpdateCastRow = (index, field, value) => {
    setEditMovieForm((prev) => {
      const updated = [...prev.cast];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, cast: updated };
    });
  };

  const handleRemoveCastRow = (index) => {
    setEditMovieForm((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index)
    }));
  };

  // Quick tag toggle helper
  const toggleQuickTag = (field, tag) => {
    setEditMovieForm((prev) => {
      const currentList = prev[field]
        ? prev[field].split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const exists = currentList.some((item) => item.toLowerCase() === tag.toLowerCase());
      const nextList = exists
        ? currentList.filter((item) => item.toLowerCase() !== tag.toLowerCase())
        : [...currentList, tag];
      return { ...prev, [field]: nextList.join(', ') };
    });
  };

  // Handle Add Theatre
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    if (!newTheatre.city) {
      toast.error('Please select a city for this theatre.');
      return;
    }
    try {
      const payload = {
        ...newTheatre,
        amenities: newTheatre.amenities.split(',').map((s) => s.trim())
      };

      const res = await adminService.createTheatre(payload);
      if (res.theatre) {
        // Also auto-create Screen 1 for this theatre
        await adminService.createScreen({
          theatre: res.theatre._id,
          screenNumber: 1,
          name: 'Screen 1 - Atmos',
          screenType: 'IMAX',
          totalSeats: 120,
          layout: {
            tiers: [
              { name: 'VIP', rows: ['A', 'B'], seatsPerRow: 12 },
              { name: 'Premium', rows: ['C', 'D', 'E', 'F'], seatsPerRow: 12 },
              { name: 'Classic', rows: ['G', 'H', 'I', 'J'], seatsPerRow: 12 }
            ],
            aisles: [3, 9]
          }
        });

        setTheatresList((prev) => [...prev, res.theatre]);
        // Refresh city theatre counts
        const fresh = await adminService.getCities();
        if (fresh.cityDetails) setCitiesList(fresh.cityDetails);
        window.dispatchEvent(new CustomEvent('cinebook:cities-changed'));
        setIsAddTheatreModal(false);
        toast.success('Cinema and default screen created.');
      }
    } catch (err) {
      toast.error(`Failed to add cinema: ${err.message}`);
    }
  };

  // Handle Add City
  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCity.name.trim()) {
      toast.error('City name is required.');
      return;
    }
    try {
      const res = await adminService.createCity({ name: newCity.name.trim(), state: newCity.state.trim() });
      if (res.city) {
        setCitiesList((prev) => [
          ...prev,
          { _id: res.city._id, name: res.city.name, slug: res.city.slug, state: res.city.state, theatresCount: 0 }
        ]);
        setNewCity({ name: '', state: '' });
        window.dispatchEvent(new CustomEvent('cinebook:cities-changed'));
        setIsAddCityModal(false);
        toast.success(`City "${res.city.name}" added. You can now add theatres to it.`);
      }
    } catch (err) {
      toast.error(`Failed to add city: ${err.message}`);
    }
  };

  // Handle Delete City
  const handleDeleteCity = async (id, name) => {
    const ok = await confirm({
      title: `Remove city "${name}"?`,
      message: 'The city will be hidden from the booking site. Existing theatres in it are unaffected.',
      confirmLabel: 'Remove',
      tone: 'danger'
    });
    if (!ok) return;
    try {
      await adminService.deleteCity(id);
      setCitiesList((prev) => prev.filter((c) => c._id !== id));
      window.dispatchEvent(new CustomEvent('cinebook:cities-changed'));
      toast.success(`City "${name}" removed.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Schedule Show
  const handleScheduleShow = async (e) => {
    e.preventDefault();
    if (!newShow.screen) {
      toast.error('The selected cinema needs at least one screen.');
      return;
    }

    try {
      const payload = {
        movie: newShow.movie,
        theatre: newShow.theatre,
        screen: newShow.screen,
        showDate: newShow.showDate,
        showTime: newShow.showTime,
        format: newShow.format,
        language: newShow.language,
        pricing: {
          classic: Number(newShow.classicPrice),
          premium: Number(newShow.premiumPrice),
          vip: Number(newShow.vipPrice)
        }
      };

      await adminService.createShow(payload);
      setIsScheduleShowModal(false);
      toast.success('Screening scheduled.');
    } catch (err) {
      toast.error(`Failed to schedule show: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Admin Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black display text-white tracking-wide flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-brand-soft" />
            <span>CineBook Control Panel</span>
          </h1>
          <p className="text-xs text-muted mt-1">
            Enterprise administration for movies, multi-city theatres, showtime scheduling, and audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="self-start sm:self-auto py-2 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-ink border border-white/10 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-raised border border-white/10 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-brand text-glow">
            ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
          </span>
          <span className="text-[10px] text-emerald-400 block font-medium">
            Verified Payments
          </span>
        </div>

        <div className="bg-raised border border-white/10 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
            Confirmed Bookings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {stats?.confirmedBookings || 0}
          </span>
          <span className="text-[10px] text-muted block font-medium">
            Total bookings: {stats?.totalBookings || 0}
          </span>
        </div>

        <div className="bg-raised border border-white/10 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
            Active Blockbusters
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalMovies || moviesList.length}
          </span>
          <span className="text-[10px] text-brand-soft block font-medium">
            Across IMAX & 4DX
          </span>
        </div>

        <div className="bg-raised border border-white/10 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
            Theatres & Halls
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalTheatres || theatresList.length}
          </span>
          <span className="text-[10px] text-muted block font-medium">
            {stats?.totalScreens || 12} Auditoriums
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'overview' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Overview & Feeds
          {activeTab === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cities')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'cities' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" /> Cities ({citiesList.length})
          {activeTab === 'cities' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movies')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'movies' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" /> Movie Library ({moviesList.length})
          {activeTab === 'movies' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theatres')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'theatres' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Theatres & Multiplexes
          {activeTab === 'theatres' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduler')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'scheduler' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" /> Showtime Scheduler
          {activeTab === 'scheduler' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 shrink-0 flex items-center gap-2 transition-all relative ${
            activeTab === 'bookings' ? 'text-brand' : 'text-muted hover:text-white'
          }`}
        >
          <Ticket className="w-4 h-4" /> All Bookings Audit
          {activeTab === 'bookings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand shadow-glow-sm"></span>
          )}
        </button>
      </div>

      {/* TAB: CITIES MANAGEMENT */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Booking Cities</h3>
              <p className="text-[11px] text-muted mt-0.5">Only theatres in active cities appear on the booking site.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddCityModal(true)}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-brand text-on-brand hover:bg-brand-hover shadow-glow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add City
            </button>
          </div>

          {citiesList.length === 0 ? (
            <div className="bg-raised border border-white/10 rounded-2xl p-10 text-center text-muted text-sm">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-brand/30" />
              <p>No cities yet. Add one to start managing theatres & bookings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {citiesList.map((city) => (
                <div
                  key={city._id || city.name}
                  className="group bg-raised border border-white/10 hover:border-brand/30 rounded-2xl p-5 flex items-start justify-between gap-3 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand shrink-0" />
                      <span className="font-bold text-white text-base leading-tight">{city.name}</span>
                    </div>
                    {city.state && (
                      <p className="text-[11px] text-muted pl-6">{city.state}</p>
                    )}
                    <div className="pl-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-soft bg-brand/10 px-2 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3" />
                        {city.theatresCount} {city.theatresCount === 1 ? 'theatre' : 'theatres'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCity(city._id, city.name)}
                    title="Remove city"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-velvet-soft transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-xs text-muted">
            <span className="font-semibold text-brand-soft">Tip: </span>
            After adding a city, go to the <button type="button" onClick={() => setActiveTab('theatres')} className="underline text-brand hover:text-white">Theatres tab</button> to add cinemas in that city.
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & RECENT BOOKINGS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-raised border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Recent Bookings Feed
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Movie</th>
                    <th className="py-2.5 px-3">Theatre</th>
                    <th className="py-2.5 px-3">Seats</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(stats?.recentBookings || allBookings.slice(0, 10)).map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-brand-soft">
                        {b.bookingReference}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {b.movieSnapshot?.title || 'Movie'}
                      </td>
                      <td className="py-3 px-3 text-muted">
                        {b.theatreSnapshot?.name || 'Multiplex'}
                      </td>
                      <td className="py-3 px-3 text-brand font-bold">
                        {b.seats?.map((s) => s.seatId).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">₹{b.totalAmount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-velvet/20 text-velvet-soft'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIE MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-brand" />
                <span>Movie Library Catalog</span>
                <span className="text-xs font-normal text-muted lowercase">
                  ({moviesList.length} total)
                </span>
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Manage cinema titles, update movie metadata, media assets, cast, and availability.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMovieModal(true)}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-brand text-on-brand hover:bg-brand-hover shadow-glow flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add New Movie
            </button>
          </div>

          {/* Search & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-raised border border-white/10 rounded-2xl p-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search movies by title, director, genre, or language..."
                value={movieSearchQuery}
                onChange={(e) => setMovieSearchQuery(e.target.value)}
                className="w-full bg-canvas border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-muted focus:border-brand focus:outline-none"
              />
              {movieSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMovieSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-white/5 shrink-0 self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMovieStatusFilter('all')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  movieStatusFilter === 'all'
                    ? 'bg-brand text-on-brand shadow-glow-sm font-bold'
                    : 'text-muted hover:text-white'
                }`}
              >
                All ({moviesList.length})
              </button>
              <button
                type="button"
                onClick={() => setMovieStatusFilter('active')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  movieStatusFilter === 'active'
                    ? 'bg-emerald-500 text-black shadow-glow-sm font-bold'
                    : 'text-muted hover:text-white'
                }`}
              >
                Active ({moviesList.filter((m) => m.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setMovieStatusFilter('inactive')}
                className={`py-1.5 px-3 rounded-lg transition-all ${
                  movieStatusFilter === 'inactive'
                    ? 'bg-amber-500 text-black shadow-glow-sm font-bold'
                    : 'text-muted hover:text-white'
                }`}
              >
                Deactivated ({moviesList.filter((m) => !m.isActive).length})
              </button>
            </div>
          </div>

          {/* Movies Grid */}
          {(() => {
            const displayedMovies = moviesList.filter((m) => {
              if (movieStatusFilter === 'active' && !m.isActive) return false;
              if (movieStatusFilter === 'inactive' && m.isActive) return false;
              if (movieSearchQuery.trim()) {
                const q = movieSearchQuery.toLowerCase();
                const matchTitle = m.title?.toLowerCase().includes(q);
                const matchGenre = m.genre?.some((g) => g.toLowerCase().includes(q));
                const matchDirector = m.director?.toLowerCase().includes(q);
                const matchLang = m.language?.some((l) => l.toLowerCase().includes(q));
                return matchTitle || matchGenre || matchDirector || matchLang;
              }
              return true;
            });

            if (displayedMovies.length === 0) {
              return (
                <div className="bg-raised border border-white/10 rounded-2xl p-12 text-center text-muted text-sm space-y-2">
                  <Film className="w-10 h-10 mx-auto opacity-30 text-brand" />
                  <p className="font-semibold text-white">No movies match your filter criteria.</p>
                  <p className="text-xs text-muted">
                    Try adjusting your search query or status filter.
                  </p>
                  {(movieSearchQuery || movieStatusFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setMovieSearchQuery('');
                        setMovieStatusFilter('all');
                      }}
                      className="mt-3 py-1.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-brand border border-brand/20 inline-flex items-center gap-1.5"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMovies.map((m) => (
                  <div
                    key={m._id}
                    className={`group relative bg-raised border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all hover:border-brand/40 shadow-lg ${
                      m.isActive ? 'border-white/10' : 'border-amber-500/30 bg-amber-950/10'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Poster Image */}
                      <div className="relative w-20 sm:w-24 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-white/10 bg-canvas shadow-md">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                            !m.isActive ? 'grayscale opacity-75' : ''
                          }`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-1 left-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-black/80 backdrop-blur-sm text-white border border-white/20">
                            {m.certificate || 'UA'}
                          </span>
                        </div>
                        {m.isFeatured && (
                          <div className="absolute top-1 right-1" title="Featured on Homepage Spotlight">
                            <span className="p-1 rounded-full bg-brand text-on-brand shadow-glow block">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </span>
                          </div>
                        )}
                        {!m.isActive && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1 text-center">
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/30 px-1 py-0.5 rounded border border-amber-500/40">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Movie Information */}
                      <div className="space-y-1.5 text-xs flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-brand transition-colors">
                            {m.title}
                          </h4>
                          {m.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-muted line-clamp-1">
                          {m.director && m.director !== 'Unknown' ? `Dir: ${m.director} • ` : ''}
                          {m.duration} mins
                        </p>

                        {/* Rating and Genre */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-brand-soft bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20 text-[11px]">
                            <Star className="w-3 h-3 fill-brand text-brand" /> {m.rating?.toFixed(1) || '0.0'}
                            {m.votesCount ? (
                              <span className="text-[9px] font-normal text-muted">({m.votesCount})</span>
                            ) : null}
                          </span>
                          <span className="text-muted text-[11px] line-clamp-1">
                            {m.genre?.slice(0, 2).join(', ')}
                            {m.genre?.length > 2 ? ` +${m.genre.length - 2}` : ''}
                          </span>
                        </div>

                        {/* Languages & Formats */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted pt-0.5">
                          {m.language?.length > 0 && (
                            <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5 line-clamp-1">
                              {m.language.join(', ')}
                            </span>
                          )}
                          {m.formats?.length > 0 && (
                            <span className="bg-brand/5 text-brand-soft px-1.5 py-0.5 rounded border border-brand/10 line-clamp-1">
                              {m.formats.join(', ')}
                            </span>
                          )}
                          {m.cast?.length > 0 && (
                            <span className="text-muted">
                              • {m.cast.length} cast
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-muted line-clamp-2 pt-0.5 leading-relaxed">
                          {m.synopsis}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons: Edit and Deactivate/Reactivate */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMovie(m)}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold bg-brand/15 hover:bg-brand text-brand hover:text-on-brand border border-brand/30 hover:border-brand transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit Movie
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActiveMovie(m)}
                          className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 ${
                            m.isActive
                              ? 'text-velvet-soft hover:bg-velvet/15 border border-white/5'
                              : 'text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20'
                          }`}
                        >
                          {m.isActive ? (
                            <>
                              <Trash2 className="w-3.5 h-3.5" /> Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: THEATRES MANAGEMENT */}
      {activeTab === 'theatres' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multiplex Theatres
            </h3>
            <button
              type="button"
              onClick={() => setIsAddTheatreModal(true)}
              className="py-2 px-4 rounded-xl font-bold text-xs bg-brand text-on-brand hover:bg-brand-hover shadow-glow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Theatre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatresList.map((t) => (
              <div
                key={t._id}
                className="bg-raised border border-white/10 rounded-2xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-base">{t.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-brand/20 text-brand text-[10px] font-bold">
                    {t.city}
                  </span>
                </div>
                <p className="text-xs text-muted">{t.address}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {t.amenities?.map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-muted"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHOWTIME SCHEDULER */}
      {activeTab === 'scheduler' && (
        <div className="bg-raised border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand" />
              <span>Schedule New Movie Screening</span>
            </h3>
            <p className="text-xs text-muted mt-1">
              Select movie, theatre hall, screening time, and tier pricing.
            </p>
          </div>

          <form onSubmit={handleScheduleShow} className="space-y-4 text-xs">
            <div>
              <label className="block text-muted font-semibold mb-1">Select Movie</label>
              <select
                value={newShow.movie}
                onChange={(e) => setNewShow({ ...newShow, movie: e.target.value })}
                className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
              >
                {moviesList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} ({m.certificate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Select Theatre</label>
                <select
                  value={newShow.theatre}
                  onChange={(e) => setNewShow({ ...newShow, theatre: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                >
                  {theatresList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Select Screen</label>
                <select
                  value={newShow.screen}
                  onChange={(e) => setNewShow({ ...newShow, screen: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                >
                  {screensForSelectedTheatre.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.screenType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newShow.showDate}
                  onChange={(e) => setNewShow({ ...newShow, showDate: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Time</label>
                <select
                  value={newShow.showTime}
                  onChange={(e) => setNewShow({ ...newShow, showTime: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="04:45 PM">04:45 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="10:45 PM">10:45 PM</option>
                </select>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-muted font-semibold mb-1">Classic (₹)</label>
                <input
                  type="number"
                  value={newShow.classicPrice}
                  onChange={(e) => setNewShow({ ...newShow, classicPrice: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Premium (₹)</label>
                <input
                  type="number"
                  value={newShow.premiumPrice}
                  onChange={(e) => setNewShow({ ...newShow, premiumPrice: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-brand-soft font-semibold mb-1">VIP (₹)</label>
                <input
                  type="number"
                  value={newShow.vipPrice}
                  onChange={(e) => setNewShow({ ...newShow, vipPrice: e.target.value })}
                  className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl font-bold text-xs uppercase bg-brand text-on-brand hover:bg-brand-hover shadow-glow transition-all"
            >
              Publish Scheduled Show
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ALL BOOKINGS AUDIT */}
      {activeTab === 'bookings' && (
        <div className="bg-raised border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            All System Bookings Audit ({allBookings.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-muted">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Movie</th>
                  <th className="py-2.5 px-3">Seats</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-muted">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-brand-soft">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {b.user?.name || 'Guest'}
                    </td>
                    <td className="py-3 px-3 text-muted">
                      {b.movieSnapshot?.title}
                    </td>
                    <td className="py-3 px-3 text-brand font-bold">
                      {b.seats?.map((s) => s.seatId).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">₹{b.totalAmount}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.bookingStatus === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-velvet/20 text-velvet-soft'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD MOVIE */}
      {isAddMovieModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddMovieModal(false);
            }}
          >
            <div className="relative w-full max-w-xl bg-raised border border-white/10 rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 bg-surface/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Add New Movie</h3>
                    <p className="text-xs text-muted">Publish a new title to the movie catalog.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMovieModal(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form id="add-movie-form" onSubmit={handleAddMovie} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted font-semibold mb-1">
                    Title <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    placeholder="e.g. Deadpool & Wolverine"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted font-semibold mb-1">
                    Synopsis <span className="text-brand">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newMovie.synopsis}
                    onChange={(e) => setNewMovie({ ...newMovie, synopsis: e.target.value })}
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-semibold mb-1">
                      Poster URL <span className="text-brand">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={newMovie.posterUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                      placeholder="https://image.tmdb.org/..."
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-semibold mb-1">Backdrop URL</label>
                    <input
                      type="url"
                      value={newMovie.backdropUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, backdropUrl: e.target.value })}
                      placeholder="https://image.tmdb.org/..."
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted font-semibold mb-1">Trailer URL (YouTube)</label>
                  <input
                    type="url"
                    value={newMovie.trailerUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted font-semibold mb-1">
                      Duration (Min) <span className="text-brand">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-semibold mb-1">Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-semibold mb-1">Certificate</label>
                    <select
                      value={newMovie.certificate}
                      onChange={(e) => setNewMovie({ ...newMovie, certificate: e.target.value })}
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    >
                      <option value="U">U</option>
                      <option value="UA">UA</option>
                      <option value="A">A</option>
                      <option value="R">R</option>
                      <option value="PG-13">PG-13</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-semibold mb-1">Director</label>
                    <input
                      type="text"
                      value={newMovie.director || ''}
                      onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                      placeholder="e.g. Denis Villeneuve"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-semibold mb-1">Languages (comma separated)</label>
                    <input
                      type="text"
                      value={newMovie.language}
                      onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                      placeholder="English, Hindi"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-semibold mb-1">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                      placeholder="Action, Sci-Fi"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted font-semibold mb-1">Formats (comma separated)</label>
                    <input
                      type="text"
                      value={newMovie.formats}
                      onChange={(e) => setNewMovie({ ...newMovie, formats: e.target.value })}
                      placeholder="2D, IMAX 3D"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-surface/60 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddMovieModal(false)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs text-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-movie-form"
                  className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand text-on-brand hover:bg-brand-hover shadow-glow transition-all"
                >
                  Create Movie
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: EDIT MOVIE */}
      {isEditMovieModal && editingMovie &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsEditMovieModal(false);
                setEditingMovie(null);
              }
            }}
          >
            <div className="relative w-full max-w-3xl bg-raised border border-white/10 rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-surface/60 flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      Edit Movie: {editMovieForm.title || editingMovie.title}
                    </h3>
                    {editMovieForm.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Modify film details, story, posters, screening formats, top cast, and availability.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditMovieModal(false);
                  setEditingMovie(null);
                }}
                className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex border-b border-white/10 px-5 sm:px-6 bg-surface/30 gap-2 sm:gap-4 overflow-x-auto scrollbar-none text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setEditModalTab('general')}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  editModalTab === 'general'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> General Info
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('media')}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  editModalTab === 'media'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Media & Posters
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('taxonomy')}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  editModalTab === 'taxonomy'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" /> Genres & Formats
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('cast')}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  editModalTab === 'cast'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Top Cast ({editMovieForm.cast?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setEditModalTab('status')}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
                  editModalTab === 'status'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Visibility & Status
              </button>
            </div>

            {/* Form Fields */}
            <form id="edit-movie-form" onSubmit={handleUpdateMovie} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* TAB 1: GENERAL */}
              {editModalTab === 'general' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted font-semibold mb-1">
                      Movie Title <span className="text-brand">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editMovieForm.title}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, title: e.target.value })}
                      placeholder="e.g. Dune: Part Two"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-muted font-semibold mb-1">
                      Synopsis / Plot Summary <span className="text-brand">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={editMovieForm.synopsis}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, synopsis: e.target.value })}
                      placeholder="Provide an overview of the movie story..."
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-muted font-semibold mb-1">Director</label>
                      <input
                        type="text"
                        value={editMovieForm.director}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, director: e.target.value })}
                        placeholder="e.g. Denis Villeneuve"
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-muted font-semibold mb-1">Release Date</label>
                      <input
                        type="date"
                        value={editMovieForm.releaseDate}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, releaseDate: e.target.value })}
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-muted font-semibold mb-1">
                        Duration (Minutes) <span className="text-brand">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editMovieForm.duration}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, duration: e.target.value })}
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-muted font-semibold mb-1">Certificate</label>
                      <select
                        value={editMovieForm.certificate}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, certificate: e.target.value })}
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      >
                        <option value="U">U (Universal)</option>
                        <option value="UA">UA (Parental Guidance)</option>
                        <option value="A">A (Adults Only)</option>
                        <option value="R">R (Restricted)</option>
                        <option value="PG-13">PG-13</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-muted font-semibold mb-1">Rating (0 - 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={editMovieForm.rating}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, rating: e.target.value })}
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-muted font-semibold mb-1">Total Votes</label>
                      <input
                        type="number"
                        min="0"
                        value={editMovieForm.votesCount}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, votesCount: e.target.value })}
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & POSTERS */}
              {editModalTab === 'media' && (
                <div className="space-y-4 text-xs">
                  {/* Poster URL */}
                  <div className="space-y-2">
                    <label className="block text-muted font-semibold">
                      Poster Image URL <span className="text-brand">*</span>
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="url"
                          required
                          value={editMovieForm.posterUrl}
                          onChange={(e) => setEditMovieForm({ ...editMovieForm, posterUrl: e.target.value })}
                          placeholder="https://image.tmdb.org/t/p/w500/..."
                          className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                        />
                        <p className="text-[11px] text-muted">
                          Vertical poster image link (standard 2:3 aspect ratio).
                        </p>
                      </div>
                      {editMovieForm.posterUrl && (
                        <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 bg-canvas shrink-0 shadow-md">
                          <img
                            src={editMovieForm.posterUrl}
                            alt="Poster Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Backdrop URL */}
                  <div className="space-y-2">
                    <label className="block text-muted font-semibold">Backdrop / Hero Banner URL</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 space-y-1">
                        <input
                          type="url"
                          value={editMovieForm.backdropUrl}
                          onChange={(e) => setEditMovieForm({ ...editMovieForm, backdropUrl: e.target.value })}
                          placeholder="https://image.tmdb.org/t/p/original/..."
                          className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                        />
                        <p className="text-[11px] text-muted">
                          Wide horizontal banner used as background for detail page and hero banner (16:9 ratio).
                        </p>
                      </div>
                      {editMovieForm.backdropUrl && (
                        <div className="w-28 h-16 rounded-lg overflow-hidden border border-white/10 bg-canvas shrink-0 shadow-md">
                          <img
                            src={editMovieForm.backdropUrl}
                            alt="Backdrop Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trailer URL */}
                  <div>
                    <label className="block text-muted font-semibold mb-1">Trailer URL (YouTube / Vimeo)</label>
                    <input
                      type="url"
                      value={editMovieForm.trailerUrl}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, trailerUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Direct YouTube or Vimeo link. Customers can watch this trailer embedded in the movie details page.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: TAXONOMY */}
              {editModalTab === 'taxonomy' && (
                <div className="space-y-5 text-xs">
                  {/* Genres */}
                  <div className="space-y-2">
                    <label className="block text-muted font-semibold">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={editMovieForm.genre}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, genre: e.target.value })}
                      placeholder="Action, Sci-Fi, Adventure"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-muted py-1 pr-1 font-semibold">Quick toggle:</span>
                      {['Action', 'Sci-Fi', 'Adventure', 'Thriller', 'Drama', 'Comedy', 'Horror', 'Romance', 'Animation', 'Fantasy', 'Crime'].map((g) => {
                        const active = editMovieForm.genre
                          ?.split(',')
                          .map((s) => s.trim().toLowerCase())
                          .includes(g.toLowerCase());
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => toggleQuickTag('genre', g)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                              active
                                ? 'bg-brand text-on-brand shadow-glow-sm'
                                : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {active ? `✓ ${g}` : `+ ${g}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="space-y-2">
                    <label className="block text-muted font-semibold">Languages (comma separated)</label>
                    <input
                      type="text"
                      value={editMovieForm.language}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, language: e.target.value })}
                      placeholder="English, Hindi, Telugu"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-muted py-1 pr-1 font-semibold">Quick toggle:</span>
                      {['English', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali'].map((l) => {
                        const active = editMovieForm.language
                          ?.split(',')
                          .map((s) => s.trim().toLowerCase())
                          .includes(l.toLowerCase());
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggleQuickTag('language', l)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                              active
                                ? 'bg-brand text-on-brand shadow-glow-sm'
                                : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {active ? `✓ ${l}` : `+ ${l}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Formats */}
                  <div className="space-y-2">
                    <label className="block text-muted font-semibold">Screening Formats (comma separated)</label>
                    <input
                      type="text"
                      value={editMovieForm.formats}
                      onChange={(e) => setEditMovieForm({ ...editMovieForm, formats: e.target.value })}
                      placeholder="2D, 3D, IMAX 3D, 4DX"
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-muted py-1 pr-1 font-semibold">Quick toggle:</span>
                      {['2D', '3D', 'IMAX', 'IMAX 3D', '4DX', 'Dolby Cinema', 'ICE'].map((f) => {
                        const active = editMovieForm.formats
                          ?.split(',')
                          .map((s) => s.trim().toLowerCase())
                          .includes(f.toLowerCase());
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleQuickTag('formats', f)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                              active
                                ? 'bg-brand text-on-brand shadow-glow-sm'
                                : 'bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {active ? `✓ ${f}` : `+ ${f}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CAST MEMBERS */}
              {editModalTab === 'cast' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Starring Cast & Characters</h4>
                      <p className="text-[11px] text-muted">Manage the actors appearing on the movie detail page.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCastRow}
                      className="py-1.5 px-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Actor
                    </button>
                  </div>

                  {editMovieForm.cast.length === 0 ? (
                    <div className="bg-canvas border border-dashed border-white/10 rounded-xl p-8 text-center text-muted">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand" />
                      <p>No cast members added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddCastRow}
                        className="mt-2 text-brand font-semibold hover:underline"
                      >
                        + Add First Cast Member
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {editMovieForm.cast.map((actor, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-canvas border border-white/10 rounded-xl flex items-center gap-3"
                        >
                          {/* Avatar Preview */}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center text-muted font-bold text-xs">
                            {actor.avatar ? (
                              <img
                                src={actor.avatar}
                                alt={actor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{actor.name ? actor.name.charAt(0).toUpperCase() : '?'}</span>
                            )}
                          </div>

                          {/* Actor Name */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              placeholder="Actor Name (e.g. Timothée Chalamet)"
                              value={actor.name}
                              onChange={(e) => handleUpdateCastRow(idx, 'name', e.target.value)}
                              className="w-full bg-surface/50 border border-white/5 rounded-lg py-1.5 px-2.5 text-white text-xs focus:border-brand focus:outline-none"
                            />
                          </div>

                          {/* Character Role */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              placeholder="Role (e.g. Paul Atreides)"
                              value={actor.role}
                              onChange={(e) => handleUpdateCastRow(idx, 'role', e.target.value)}
                              className="w-full bg-surface/50 border border-white/5 rounded-lg py-1.5 px-2.5 text-white text-xs focus:border-brand focus:outline-none"
                            />
                          </div>

                          {/* Avatar URL */}
                          <div className="flex-1 min-w-0 hidden sm:block">
                            <input
                              type="url"
                              placeholder="Avatar URL (optional)"
                              value={actor.avatar}
                              onChange={(e) => handleUpdateCastRow(idx, 'avatar', e.target.value)}
                              className="w-full bg-surface/50 border border-white/5 rounded-lg py-1.5 px-2.5 text-white text-xs focus:border-brand focus:outline-none"
                            />
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCastRow(idx)}
                            className="p-1.5 rounded-lg text-muted hover:text-velvet-soft transition-colors shrink-0"
                            title="Remove actor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: VISIBILITY & STATUS */}
              {editModalTab === 'status' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-canvas border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-brand" /> Featured Movie Spotlight
                      </span>
                      <p className="text-muted">
                        When enabled, this movie is highlighted in the top carousel banner on the homepage.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={editMovieForm.isFeatured}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, isFeatured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand" />
                    </label>
                  </div>

                  <div className="bg-canvas border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-400" /> Active in Public Catalog
                      </span>
                      <p className="text-muted">
                        When active, movie is published, discoverable in listings, and available for showtime bookings.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={editMovieForm.isActive}
                        onChange={(e) => setEditMovieForm({ ...editMovieForm, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-surface/60 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditMovieModal(false);
                  setEditingMovie(null);
                }}
                className="py-2 px-4 rounded-xl font-semibold text-xs text-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="edit-movie-form"
                disabled={savingMovie}
                className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand text-on-brand hover:bg-brand-hover shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingMovie ? (
                  <>Saving Updates...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Movie Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: ADD THEATRE */}
      {isAddTheatreModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddTheatreModal(false);
            }}
          >
            <div className="relative w-full max-w-md bg-raised border border-white/10 rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 bg-surface/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Add Multiplex Theatre</h3>
                    <p className="text-xs text-muted">Register cinema location and default screen.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddTheatreModal(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form id="add-theatre-form" onSubmit={handleAddTheatre} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted mb-1 font-semibold">
                    Theatre Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTheatre.name}
                    onChange={(e) => setNewTheatre({ ...newTheatre, name: e.target.value })}
                    placeholder="e.g. PVR Superplex City Centre"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 font-semibold">
                    City <span className="text-brand">*</span>
                  </label>
                  {citiesList.length > 0 ? (
                    <select
                      required
                      value={newTheatre.city}
                      onChange={(e) => setNewTheatre({ ...newTheatre, city: e.target.value })}
                      className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                    >
                      <option value="">— Select a city —</option>
                      {citiesList.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                          {c.state ? ` (${c.state})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        required
                        value={newTheatre.city}
                        onChange={(e) => setNewTheatre({ ...newTheatre, city: e.target.value })}
                        placeholder="e.g. Mumbai, Delhi-NCR, Bengaluru"
                        className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                      />
                      <p className="text-[10px] text-amber-400">
                        No cities configured yet.{' '}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => {
                            setIsAddTheatreModal(false);
                            setActiveTab('cities');
                          }}
                        >
                          Add cities first
                        </button>{' '}
                        for a dropdown.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-muted mb-1 font-semibold">
                    Address <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTheatre.address}
                    onChange={(e) => setNewTheatre({ ...newTheatre, address: e.target.value })}
                    placeholder="Street and mall address"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-muted mb-1 font-semibold">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={newTheatre.amenities}
                    onChange={(e) => setNewTheatre({ ...newTheatre, amenities: e.target.value })}
                    placeholder="Dolby Atmos, Recliners, Food Court"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-surface/60 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddTheatreModal(false)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs text-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-theatre-form"
                  className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand text-on-brand hover:bg-brand-hover shadow-glow transition-all"
                >
                  Create Theatre & Screen
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 3: ADD CITY */}
      {isAddCityModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddCityModal(false);
            }}
          >
            <div className="relative w-full max-w-sm bg-raised border border-white/10 rounded-2xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 bg-surface/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add New City</h3>
                    <p className="text-[11px] text-muted">Enable cinema locations in a new city.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCityModal(false)}
                  className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form id="add-city-form" onSubmit={handleAddCity} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-muted mb-1 font-semibold">
                    City Name <span className="text-velvet-soft">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity.name}
                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    placeholder="e.g. Hyderabad, Ahmedabad, Jaipur"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted mb-1 font-semibold">
                    State <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newCity.state}
                    onChange={(e) => setNewCity({ ...newCity, state: e.target.value })}
                    placeholder="e.g. Maharashtra, Karnataka"
                    className="w-full bg-canvas border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              </form>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-surface/60 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddCityModal(false)}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs text-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-city-form"
                  className="py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand text-on-brand hover:bg-brand-hover shadow-glow transition-all"
                >
                  Add City
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AdminDashboard;
