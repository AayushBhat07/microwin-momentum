import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Heart, Star, Target, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      {/* Navigation */}
      <motion.nav 
        className="w-full py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">MicroWin Momentum</span>
          </motion.div>
          
          <AuthButton 
            trigger={
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                Get Started Free
              </Button>
            }
            dashboardTrigger={
              <Button size="lg" variant="outline">
                Go to Dashboard
              </Button>
            }
          />
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-accent/50 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span>Celebrate Every Victory</span>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Turn Small Wins Into
            <span className="text-primary block">Big Momentum</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Combat perfectionism and boost motivation by celebrating daily achievements. 
            Join a supportive community that cheers for every step forward, no matter how small.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AuthButton 
              trigger={
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  Start Celebrating Today
                  <Star className="ml-2 w-5 h-5" />
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Why MicroWin Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on positive psychology principles to help you build lasting motivation and overcome perfectionism.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Daily Achievement Tracking",
              description: "Log and celebrate small wins every day. Build momentum through consistent progress recognition.",
              color: "text-primary"
            },
            {
              icon: Users,
              title: "Supportive Community",
              description: "Share your victories with others who understand the journey. Give and receive encouragement.",
              color: "text-chart-2"
            },
            {
              icon: TrendingUp,
              title: "Progress Visualization",
              description: "See your growth over time with streaks, points, and achievement analytics that motivate you.",
              color: "text-chart-3"
            },
            {
              icon: Heart,
              title: "Positive Reinforcement",
              description: "Every achievement earns points and celebrations. Focus on progress, not perfection.",
              color: "text-chart-4"
            },
            {
              icon: Award,
              title: "Gamified Experience",
              description: "Level up, earn badges, and maintain streaks. Make personal growth fun and engaging.",
              color: "text-chart-5"
            },
            {
              icon: Zap,
              title: "Instant Motivation",
              description: "Get daily motivational content and immediate positive feedback for every step forward.",
              color: "text-primary"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10 rounded-2xl p-12 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Celebrate Your Journey?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of people who are building momentum through daily wins. 
            Start your journey to sustainable motivation today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <AuthButton 
              trigger={
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  Start Your First MicroWin
                  <Star className="ml-2 w-5 h-5" />
                </Button>
              }
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="border-t bg-card/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Star className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">MicroWin Momentum</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MicroWin Momentum. Celebrating progress, one win at a time.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}