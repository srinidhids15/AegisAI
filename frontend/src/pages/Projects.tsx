import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Archive, GitBranch, Calendar, Code2, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { fadeInUp, staggerContainer } from '../animations/motionPresets';
import { projectsService, type ProjectResponse } from '../services/projects';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getUserProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-custom animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <h1 className="text-3xl font-bold text-white tracking-tight">Scan History</h1>
        <p className="text-text-secondary mt-1">Review previously analyzed codebases and active intelligence mappings.</p>
      </motion.div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-white/10 bg-background/30">
          <Archive className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Analzyed</h3>
          <p className="text-text-secondary max-w-sm mx-auto mb-6">You haven't ingested any source code yet. Head over to the Analyze page to start your first scan.</p>
          <Button onClick={() => navigate('/ingest')}>
            Initialize Scan <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.id} variants={fadeInUp}>
              <Card className="flex flex-col h-full bg-background/50 hover:bg-background transition-colors group">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-primary-custom/10 text-primary-custom">
                      {project.source_type === 'git' ? <GitBranch className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={project.name}>
                    {project.name}
                  </h3>
                  
                  {project.repo_url && (
                    <p className="text-sm font-mono text-white/40 mb-4 line-clamp-1">
                      {project.repo_url}
                    </p>
                  )}

                  <div className="mt-6 space-y-3">
                    {project.detected_languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Code2 className="w-4 h-4 text-white/40" />
                        <div className="flex flex-wrap gap-2">
                          {project.detected_languages.slice(0, 3).map((lang) => (
                            <span key={lang} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                              {lang}
                            </span>
                          ))}
                          {project.detected_languages.length > 3 && (
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/40">
                              +{project.detected_languages.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-border-custom bg-black/20">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center group-hover:border-primary-custom/50 group-hover:text-white transition-colors"
                    onClick={() => navigate(`/vulnerabilities?projectId=${project.id}`)}
                  >
                    View Report <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Projects;
