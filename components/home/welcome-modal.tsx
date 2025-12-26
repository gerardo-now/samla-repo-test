"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Phone,
  Bot,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeStep {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const steps: WelcomeStep[] = [
  {
    icon: MessageSquare,
    title: "Una bandeja para todo",
    description: "Recibe mensajes de WhatsApp y llamadas telefónicas en un solo lugar. Sin cambiar de app, sin perder conversaciones.",
    color: "text-green-600 bg-green-500/10",
  },
  {
    icon: Bot,
    title: "Agentes que trabajan por ti",
    description: "Crea agentes de IA que responden automáticamente con voz humana. Atienden 24/7, agendan citas, y resuelven dudas.",
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    icon: Calendar,
    title: "Citas sin fricciones",
    description: "Tus agentes revisan tu calendario y agendan citas automáticamente. Sin doble reserva, sin ir y venir de mensajes.",
    color: "text-purple-600 bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "Listo para empezar",
    description: "Te guiaremos paso a paso para configurar todo. En menos de 10 minutos tendrás tu primer agente funcionando.",
    color: "text-amber-600 bg-amber-500/10",
  },
];

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("samla_welcome_seen");
    if (!hasSeenWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("samla_welcome_seen", "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", step.color)}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          {!isLastStep && (
            <Button variant="ghost" onClick={handleSkip} className="sm:mr-auto">
              Saltar
            </Button>
          )}
          <Button onClick={handleNext} className="w-full sm:w-auto">
            {isLastStep ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                ¡Empezar!
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

