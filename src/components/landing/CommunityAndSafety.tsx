import { motion } from "framer-motion";
import { Heart, Lock, Shield } from "lucide-react";

const CommentCard = ({ name, comment, delay }: any) => (
    <motion.div
        className="bg-card border rounded-xl p-4 flex items-start gap-3"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
    >
        <div className="w-10 h-10 rounded-full bg-secondary/20 flex-shrink-0 flex items-center justify-center">
            <Heart className="w-5 h-5 text-secondary" />
        </div>
        <div>
            <p className="font-bold text-sm">{name}</p>
            <p className="text-sm text-muted-foreground">{comment}</p>
        </div>
    </motion.div>
);

const SafetyFeature = ({ icon: Icon, title, description }: any) => (
    <div className="flex items-start gap-4">
        <Icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
        <div>
            <h4 className="font-bold">{title}</h4>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    </div>
);

export function CommunityAndSafety() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-4">A Community That Cheers You On</h2>
                        <p className="text-lg text-muted-foreground mb-8">Share your wins (if you want) and get encouragement from a positive, non-judgmental community.</p>
                        <div className="space-y-4">
                            <CommentCard name="Sarah K." comment="You all inspired me to finally clean my garage! +15 points!" delay={0.1} />
                            <CommentCard name="Mike T." comment="7-day streak! Let's gooo! 🔥" delay={0.2} />
                            <CommentCard name="Anonymous" comment="Just wanted to say thanks for being a safe space." delay={0.3} />
                        </div>
                    </div>
                    <div className="bg-card border rounded-2xl p-8">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Your Space, Your Control</h2>
                        <p className="text-lg text-muted-foreground mb-8">We're committed to your privacy and safety. You decide what to share.</p>
                        <div className="space-y-6">
                            <SafetyFeature icon={Shield} title="Anonymous Mode" description="Post achievements without revealing your identity whenever you need to." />
                            <SafetyFeature icon={Lock} title="You Control Your Data" description="Easily manage and delete your data. We don't sell it, period." />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
