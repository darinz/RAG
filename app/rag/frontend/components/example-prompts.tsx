import { Card } from "@/components/ui/card"

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void
}

const EXAMPLE_PROMPTS = [
  {
    title: "Summarize the main points",
    description: "Get a quick overview of the document's key content",
    icon: "📄"
  },
  {
    title: "What are the key findings?",
    description: "Extract important discoveries or results",
    icon: "🔍"
  },
  {
    title: "Explain the methodology",
    description: "Understand how the research or analysis was conducted",
    icon: "⚙️"
  },
  {
    title: "What are the recommendations?",
    description: "Find suggested actions or next steps",
    icon: "💡"
  },
  {
    title: "Compare different sections",
    description: "Analyze differences between parts of the document",
    icon: "⚖️"
  },
  {
    title: "Find specific data points",
    description: "Locate numbers, statistics, or quantitative information",
    icon: "📊"
  }
]

export function ExamplePrompts({ onPromptSelect }: ExamplePromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {EXAMPLE_PROMPTS.map((prompt, i) => (
        <Card 
          key={i} 
          className="p-6 cursor-pointer hover:bg-muted/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group min-h-[140px] flex flex-col"
          onClick={() => onPromptSelect(prompt.title)}
        >
          <div className="text-center space-y-3 flex flex-col h-full">
            <div className="text-3xl flex-shrink-0">{prompt.icon}</div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors flex-shrink-0">{prompt.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 flex items-center justify-center">{prompt.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

