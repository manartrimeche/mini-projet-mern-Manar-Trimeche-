import { useState, useEffect } from 'react';
import api from '../api/api';

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks?status=${filter}`);
      setTasks(response.data.tasks);
      setStats(response.data.stats);
    } catch (err) {
      console.error('❌ Erreur chargement tâches:', err);
      setError('Impossible de charger les tâches');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/complete`);
      console.log('✅ Tâche complétée:', response.data);
      
      // Afficher message de succès
      alert(response.data.message);
      
      // Recharger les tâches
      fetchTasks();
    } catch (err) {
      console.error('❌ Erreur complétion tâche:', err);
      alert(err.response?.data?.message || 'Erreur lors de la complétion');
    }
  };

  const updateProgress = async (taskId, current) => {
    try {
      const response = await api.put(`/tasks/${taskId}/progress`, {
        progress: { current }
      });
      console.log('✅ Progression mise à jour:', response.data);
      
      if (response.data.task.status === 'completed') {
        alert(response.data.message);
      }
      
      fetchTasks();
    } catch (err) {
      console.error('❌ Erreur mise à jour progression:', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Chargement des tâches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🎯 Mes Missions</h2>
        <p style={styles.subtitle}>Complétez vos missions pour gagner des points et des badges!</p>
      </div>

      {/* Statistiques */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>En attente</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔄</div>
          <div style={styles.statValue}>{stats.inProgress}</div>
          <div style={styles.statLabel}>En cours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats.completed}</div>
          <div style={styles.statLabel}>Complétées</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filters}>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterButton,
            ...(filter === 'pending' ? styles.filterButtonActive : {})
          }}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          style={{
            ...styles.filterButton,
            ...(filter === 'in-progress' ? styles.filterButtonActive : {})
          }}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'completed' ? styles.filterButtonActive : {})
          }}
        >
          Complétées
        </button>
      </div>

      {/* Liste des tâches */}
      <div style={styles.tasksList}>
        {tasks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p>Aucune tâche {filter === 'pending' ? 'en attente' : filter === 'in-progress' ? 'en cours' : 'complétée'}</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <div style={styles.taskIcon}>{task.icon}</div>
                <div style={styles.taskInfo}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <p style={styles.taskDescription}>{task.description}</p>
                  <div style={styles.taskMeta}>
                    <span style={styles.taskCategory}>
                      {getCategoryLabel(task.category)}
                    </span>
                    <span style={styles.taskType}>
                      {getTypeLabel(task.type)}
                    </span>
                    {task.aiGenerated && (
                      <span style={styles.aiTag}>  IA</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              {task.progress && task.progress.target > 1 && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(task.progress.current / task.progress.target) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span style={styles.progressText}>
                    {task.progress.current} / {task.progress.target}
                  </span>
                </div>
              )}

              {/* Récompenses */}
              <div style={styles.rewards}>
                <span style={styles.rewardBadge}>⭐ {task.rewards.points} points</span>
                {task.rewards.discountPoints && task.rewards.discountPoints > 0 && (
                  <span style={styles.rewardBadge}>🛒 -{task.rewards.discountPoints} au panier</span>
                )}
                {task.rewards.badge && (
                  <span style={styles.rewardBadge}>{task.rewards.badge}</span>
                )}
              </div>

              {/* Actions */}
              {task.status !== 'completed' && (
                <div style={styles.taskActions}>
                  {task.progress.target > 1 ? (
                    <button
                      onClick={() => updateProgress(task._id, task.progress.current + 1)}
                      style={styles.progressButton}
                    >
                      Progresser ({task.progress.current + 1}/{task.progress.target})
                    </button>
                  ) : (
                    <button
                      onClick={() => completeTask(task._id)}
                      style={styles.completeButton}
                    >
                      ✅ Marquer comme complété
                    </button>
                  )}
                </div>
              )}

              {task.status === 'completed' && task.completedAt && (
                <div style={styles.completedBadge}>
                  ✅ Complétée le {new Date(task.completedAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getCategoryLabel(category) {
  const labels = {
    skincare: '🧴 Soin de la peau',
    haircare: '💆 Soin des cheveux',
    routine: '⏰ Routine',
    shopping: '🛍️ Shopping',
    review: '⭐ Avis',
    social: '👥 Social'
  };
  return labels[category] || category;
}

function getTypeLabel(type) {
  const labels = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    onboarding: 'Démarrage',
    challenge: 'Défi',
    special: 'Spécial'
  };
  return labels[type] || type;
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '10px 20px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    transition: 'all 0.2s ease'
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    color: '#fff',
    borderColor: '#667eea'
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  taskHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  taskIcon: {
    fontSize: '40px',
    flexShrink: 0
  },
  taskInfo: {
    flex: 1
  },
  taskTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  taskDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 10px 0'
  },
  taskMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  taskCategory: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    color: '#4b5563',
    fontWeight: '500'
  },
  taskType: {
    fontSize: '12px',
    padding: '4px 10px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    color: '#1e40af',
    fontWeight: '500'
  },
  aiTag: {
    fontSize: '12px',
    padding: '4px 10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: '500'
  },
  progressContainer: {
    marginBottom: '15px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '5px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },
  rewards: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '15px'
  },
  rewardBadge: {
    fontSize: '13px',
    padding: '6px 12px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    color: '#92400e',
    fontWeight: '600'
  },
  taskActions: {
    display: 'flex',
    gap: '10px'
  },
  completeButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  progressButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  completedBadge: {
    padding: '10px',
    backgroundColor: '#d1fae5',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'center'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#6b7280'
  },
  error: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    borderRadius: '12px'
  }
};
