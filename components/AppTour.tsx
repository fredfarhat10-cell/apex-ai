import React from 'react';
import { useStore } from '../store/useStore';
import { Zap, Compass, Command, MessageCircle, PartyPopper } from 'lucide-react';

const tourSteps = [
  {
    icon: <PartyPopper className="text-apex-primary" size={48} />,
    title: 'Welcome to Apex!',
    content: "This quick tour will guide you through the core features of your new cognitive co-pilot. Let's begin.",
    position: 'center',
  },
  {
    icon: <Compass className="text-apex-primary" size={48} />,
    title: 'The Sidebar is Your Compass',
    content: 'Navigate through different modules like Strategy, Financials, and your AI Stylist. Each is a specialized tool to help you achieve your goals.',
    position: 'left',
  },
  {
    icon: <Command className="text-apex-primary" size={48} />,
    title: 'The Command Bar',
    content: 'Press CMD+K (or CTRL+K) at any time to open the command bar. It\'s the fastest way to add expenses, set reminders, or interact with the AI.',
    position: 'center',
  },
  {
    icon: <MessageCircle className="text-apex-primary" size={48} />,
    title: 'Your AI Chat Assistant',
    content: 'For a more conversational experience, use the global AI chat. It has context on your current goals and activities, ready to assist you anytime.',
    position: 'bottom-right',
  },
  {
    icon: <Zap className="text-apex-primary" size={48} />,
    title: 'You\'re All Set!',
    content: 'You\'re ready to go. Start by setting a goal in the Strategy module or just explore. Welcome to a more optimized life.',
    position: 'center',
  },
];

const AppTour: React.FC = () => {
  const isTourActive = useStore((state) => state.isTourActive);
  const tourStep = useStore((state) => state.tourStep);
  const nextTourStep = useStore((state) => state.nextTourStep);
  const endTour = useStore((state) => state.endTour);

  if (!isTourActive) {
    return null;
  }
  
  const currentStep = tourSteps[tourStep];
  if (!currentStep) {
    endTour(); // End tour if step is out of bounds
    return null;
  }

  const isLastStep = tourStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      endTour();
    } else {
      nextTourStep();
    }
  };

  const positionClasses: { [key: string]: string } = {
    center: 'items-center justify-center',
    left: 'items-center justify-start pl-72', // 16rem sidebar width + 2rem padding
    'bottom-right': 'items-end justify-end pb-24 pr-24',
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex p-8 animate-fadeIn" style={{ backdropFilter: 'blur(4px)' }}>
      <div className={`w-full h-full flex ${positionClasses[currentStep.position]}`}>
        <div className="bg-apex-dark border border-gray-700 rounded-lg shadow-2xl p-8 w-full max-w-md flex flex-col items-center text-center animate-fadeIn">
          <div className="mb-4">{currentStep.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
          <p className="text-apex-gray mb-6">{currentStep.content}</p>
          
          <div className="flex items-center gap-4 w-full mt-auto">
            <button onClick={endTour} className="text-sm text-apex-gray hover:text-apex-light">Skip Tour</button>
            <div className="flex-grow flex items-center justify-center gap-2">
                {tourSteps.map((_, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === tourStep ? 'bg-apex-primary' : 'bg-gray-600'}`}></div>
                ))}
            </div>
            <button 
                onClick={handleNext} 
                className="bg-apex-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors"
            >
                {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
