import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  AccountBalanceWallet, AssignmentTurnedIn, EmojiEvents, FolderSpecial, Insights,
  MonetizationOn, RocketLaunch, TaskAlt,
} from '@mui/icons-material';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/MetricCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../providers/AuthProvider.jsx';
import { subscribeUserCollection } from '../lib/firestore.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const collections = ['documents', 'projects', 'finance', 'loans', 'milestones', 'achievements', 'skills', 'jobs', 'socialLinks', 'timeline'];

function sum(items, field = 'amount') {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function monthLabel(date = '') {
  if (!date) return 'Undated';
  return new Date(date).toLocaleDateString('en-US', { month: 'short' });
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const theme = useTheme();
  const [data, setData] = useState(Object.fromEntries(collections.map((key) => [key, []])));

  useEffect(() => {
    const unsubscribers = collections.map((key) => subscribeUserCollection(user.uid, key, (items) => {
      setData((current) => ({ ...current, [key]: items }));
    }));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user.uid]);

  const summary = useMemo(() => {
    const finance = data.finance;
    const income = finance.filter((item) => ['Salary', 'Income', 'Side income'].includes(item.type));
    const expenses = finance.filter((item) => item.type === 'Expense');
    const assets = finance.filter((item) => ['Asset', 'Savings'].includes(item.type));
    const debts = finance.filter((item) => item.type === 'Debt');
    const loanBalance = data.loans.reduce((total, loan) => total + Number(loan.amountBorrowed || 0) + Number(loan.interest || 0) - Number(loan.amountPaid || 0), 0);
    const netWorth = sum(assets) + sum(income) - sum(expenses) - sum(debts) - loanBalance;
    const activeProjects = data.projects.filter((item) => !['Launched', 'Monetizing'].includes(item.status)).length;
    const pendingTasks = data.projects.reduce((total, project) => total + (project.tasks?.length || 0), 0);
    const upcomingMilestones = data.milestones.filter((item) => item.status !== 'Completed').length;
    const achievementProgress = data.milestones.length ? Math.round((data.milestones.filter((item) => item.status === 'Completed').length / data.milestones.length) * 100) : 0;
    const financialHealth = Math.max(0, Math.min(100, Math.round(50 + (netWorth > 0 ? 25 : -15) + (sum(income) > sum(expenses) ? 15 : -10) - (loanBalance > sum(income) ? 15 : 0))));
    return { income: sum(income), expenses: sum(expenses), assets: sum(assets), loanBalance, netWorth, activeProjects, pendingTasks, upcomingMilestones, achievementProgress, financialHealth };
  }, [data]);

  const incomeChart = useMemo(() => {
    const buckets = {};
    data.finance.filter((item) => ['Salary', 'Income', 'Side income'].includes(item.type)).forEach((item) => {
      const key = monthLabel(item.date);
      buckets[key] = (buckets[key] || 0) + Number(item.amount || 0);
    });
    return Object.entries(buckets).map(([month, amount]) => ({ month, amount })).slice(0, 8);
  }, [data.finance]);

  const loanChart = data.loans.map((loan) => ({
    name: loan.lender || 'Loan',
    paid: Number(loan.amountPaid || 0),
    balance: Math.max(0, Number(loan.amountBorrowed || 0) + Number(loan.interest || 0) - Number(loan.amountPaid || 0)),
  }));

  const assetChart = [
    { name: 'Assets', value: Math.max(0, summary.assets), color: theme.palette.primary.main },
    { name: 'Income', value: Math.max(0, summary.income), color: theme.palette.success.main },
    { name: 'Loans', value: Math.max(0, summary.loanBalance), color: theme.palette.warning.main },
    { name: 'Expenses', value: Math.max(0, summary.expenses), color: theme.palette.secondary.main },
  ];

  const insights = [
    data.projects.filter((item) => !['Launched', 'Monetizing'].includes(item.status)).length > 0 && `You have ${summary.activeProjects} unfinished projects.`,
    !data.documents.some((item) => item.category === 'CV' && item.isLatestCv) && 'Your CV needs a latest version in the vault.',
    summary.loanBalance > summary.income && 'Your loan balance is still high compared with tracked income.',
    data.milestones.some((item) => Number(item.progress || 0) >= 80 && item.status !== 'Completed') && 'You are close to completing a milestone.',
    data.projects.some((item) => item.status === 'Monetizing') ? 'Keep measuring revenue from monetizable projects this week.' : 'Focus on one monetizable project this week.',
  ].filter(Boolean);

  return (
    <Box>
      <PageHeader
        title={`Welcome${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}`}
        subtitle="Your personal operating system for momentum, money, proof, and priorities."
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        <MetricCard label="Net worth" value={money.format(summary.netWorth)} hint="Assets + income - debts" icon={AccountBalanceWallet} />
        <MetricCard label="Total income" value={money.format(summary.income)} hint="Salary and side income" icon={Insights} color="success.main" />
        <MetricCard label="Total loans" value={money.format(summary.loanBalance)} hint="Outstanding balance" icon={MonetizationOn} color="warning.main" />
        <MetricCard label="Active projects" value={summary.activeProjects} hint={`${summary.pendingTasks} pending tasks`} icon={RocketLaunch} color="secondary.main" />
        <MetricCard label="Upcoming milestones" value={summary.upcomingMilestones} hint="Not completed yet" icon={AssignmentTurnedIn} />
        <MetricCard label="Achievement progress" value={`${summary.achievementProgress}%`} hint={`${data.achievements.length} achievements saved`} icon={EmojiEvents} color="warning.main" />
        <MetricCard label="Financial health" value={`${summary.financialHealth}/100`} hint="Local score from your entries" icon={TaskAlt} color="success.main" />
        <MetricCard label="Documents" value={data.documents.length} hint="Vault records" icon={FolderSpecial} color="secondary.main" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.35fr 0.65fr' }, gap: 2.5 }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 390 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5">Financial pulse</Typography>
              <Typography color="text.secondary">Income, loans, assets, and expenses from your records.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {['/finance', '/projects', '/documents'].map((path) => (
                <Button key={path} component={Link} to={path} variant="outlined" size="small">{path.slice(1)}</Button>
              ))}
            </Stack>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.65fr' }, gap: 2, height: { xs: 560, lg: 290 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeChart.length ? incomeChart : [{ month: 'Start', amount: 0 }]}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke={theme.palette.primary.main} fill="url(#incomeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetChart} dataKey="value" nameKey="name" innerRadius={54} outerRadius={92} paddingAngle={4}>
                  {assetChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="h5">AI Keeper Notes</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Local insights generated from your current data.</Typography>
          <Stack spacing={1.5}>
            {(insights.length ? insights : ['Add records across qiparh to unlock smart personal insights.']).map((insight) => (
              <Paper key={insight} sx={{ p: 1.7, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <Typography fontWeight={750}>{insight}</Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5, mt: 2.5 }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 310 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Loan repayment</Typography>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={loanChart.length ? loanChart : [{ name: 'No loans', paid: 0, balance: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.08)} />
              <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <Tooltip />
              <Bar dataKey="paid" stackId="a" fill={theme.palette.success.main} />
              <Bar dataKey="balance" stackId="a" fill={theme.palette.warning.main} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Goal progress</Typography>
          <Stack spacing={1.8}>
            {(data.milestones.length ? data.milestones.slice(0, 6) : [{ title: 'No milestones yet', progress: 0, category: 'Start now' }]).map((item) => (
              <Box key={item.id || item.title}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography fontWeight={800}>{item.title}</Typography>
                  <Chip size="small" label={item.category || item.status || 'Goal'} />
                </Stack>
                <LinearProgress variant="determinate" value={Number(item.progress || 0)} sx={{ mt: 1, height: 9, borderRadius: 8 }} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
