import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";
import { useState } from "react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock profit data for the current month
  const generateMockProfitData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: { [key: string]: number } = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Generate random profit/loss between -500 and 2000
      data[dateKey] = Math.floor(Math.random() * 2500) - 500;
    }
    
    return data;
  };

  const profitData = generateMockProfitData();
  
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'bg-green-500/20 text-green-600 border-green-500/30';
    if (profit < 0) return 'bg-red-500/20 text-red-600 border-red-500/30';
    return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  };

  const getProfitIcon = (profit: number) => {
    if (profit > 0) return <TrendingUp className="w-3 h-3" />;
    if (profit < 0) return <TrendingDown className="w-3 h-3" />;
    return <Target className="w-3 h-3" />;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTotalProfit = () => {
    return Object.values(profitData).reduce((sum, profit) => sum + profit, 0);
  };

  const getAverageProfit = () => {
    const profits = Object.values(profitData);
    return profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) / profits.length : 0;
  };

  const getBestDay = () => {
    const entries = Object.entries(profitData);
    if (entries.length === 0) return { day: 0, profit: 0 };
    
    const best = entries.reduce((max, [day, profit]) => 
      profit > max.profit ? { day: parseInt(day.split('-')[2]), profit } : max
    , { day: 0, profit: -Infinity });
    
    return best;
  };

  const getWorstDay = () => {
    const entries = Object.entries(profitData);
    if (entries.length === 0) return { day: 0, profit: 0 };
    
    const worst = entries.reduce((min, [day, profit]) => 
      profit < min.profit ? { day: parseInt(day.split('-')[2]), profit } : min
    , { day: 0, profit: Infinity });
    
    return worst;
  };

  const days = getDaysInMonth(currentDate);
  const totalProfit = getTotalProfit();
  const averageProfit = getAverageProfit();
  const bestDay = getBestDay();
  const worstDay = getWorstDay();

  return (
    <div className="flex min-h-min flex-col">
        {/* Top Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Trading Calendar</h1>
                <p className="text-muted-foreground">Daily profit tracking and analysis</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Calendar Content */}
        <main className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
                <DollarSign className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${totalProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${averageProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  ${averageProfit.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per day</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Best Day</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  Day {bestDay.day}
                </div>
                <p className="text-xs text-green-500 mt-1">+${bestDay.profit.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Worst Day</CardTitle>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  Day {worstDay.day}
                </div>
                <p className="text-xs text-red-500 mt-1">${worstDay.profit.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {getMonthName(currentDate)}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2" />;
                  }
                  
                  const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const profit = profitData[dateKey] || 0;
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                  
                  return (
                    <div
                      key={day}
                      className={`p-2 min-h-[80px] border rounded-lg transition-all hover:scale-105 cursor-pointer ${
                        isToday ? 'ring-2 ring-primary' : ''
                      } ${getProfitColor(profit)}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{day}</span>
                          {profit !== 0 && getProfitIcon(profit)}
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-xs font-bold ${
                              profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {profit > 0 ? '+' : ''}${profit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
              <span className="text-muted-foreground">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
              <span className="text-muted-foreground">Loss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-500/20 border border-gray-500/30" />
              <span className="text-muted-foreground">Break Even</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary" />
              <span className="text-muted-foreground">Today</span>
            </div>
          </div>
        </main>
    </div>
  );
};

export default Calendar;
