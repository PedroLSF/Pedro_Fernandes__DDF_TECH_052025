import Chip from '@mui/material/Chip';

import { IRole } from '../../types/role';
import SearchAutocomplete from '../search-autocomplete';

type Props = {
  name: string;
  label: string;
  placeholder: string;
  value?: null | IRole;
};
export default function RoleSelector(props: Props) {
  return (
    <SearchAutocomplete
      {...props}
      getSearchPayload={(search: string) => ({ name: search })}
      url="/role"
      renderOption={(p, option) => (
        <li {...p} key={option.id}>
          {typeof option === 'string' ? option : option.name}
        </li>
      )}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={typeof option === 'string' ? option : option.id}
            label={typeof option === 'string' ? option : option.name}
            size="small"
            variant="soft"
            data-cy={typeof option === 'string' ? option : `opt-${option.name}`}
          />
        ))
      }
    />
  );
}
