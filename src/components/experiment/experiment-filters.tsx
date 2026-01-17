'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const stages = ['all', 'idea', 'active', 'validation', 'paused', 'archived'];

type Props = {
  search: string;
  stage: string;
  onSearchChange: (value: string) => void;
  onStageChange: (value: string) => void;
};

export const ExperimentFilters = ({
  search,
  stage,
  onSearchChange,
  onStageChange
}: Props) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex-1">
        <Input
          placeholder="Search experiments..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="w-full md:w-48">
        <Select value={stage} onChange={(event) => onStageChange(event.target.value)}>
          {stages.map((item) => (
            <option key={item} value={item}>
              {item === 'all' ? 'All stages' : item}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
