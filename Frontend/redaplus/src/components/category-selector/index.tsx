import { omit } from 'lodash';
import { useSnackbar } from 'notistack';
import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import Label from '../label';
import Iconify from '../iconify';
import Scrollbar from '../scrollbar/scrollbar';
import { ICategory } from '../../types/category';
import SearchNotFound from '../search-not-found';
import { useAuthContext } from '../../auth/hooks';
import { useBoolean } from '../../hooks/use-boolean';
import { fetcher, endpoints } from '../../utils/axios';
import { getCategoryId } from '../../utils/getCategoryId';

type Props = {
  disabled?: boolean;
  label: string;
  value?: null | ICategory | ICategory[];
  categoryId?: string;
  multiple?: boolean;
  is_primary?: boolean;
  onChange?: (value: ICategory | ICategory[] | null) => void;
  showOnlyPrimaries?: boolean;
  directories?: boolean;
  entities?: boolean;
  restrict_primaries?: boolean;
  filter_in_channel?: boolean;
  channel_id?: string;
  select_double_click?: boolean;
};

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`&[data-highlighted="true"] > .${treeItemClasses.content}`]: {
    background: theme.palette.warning.main,
  },
  [`&[data-disabled="true"] > .${treeItemClasses.content}`]: {
    color: theme.palette.grey[400],
    cursor: 'not-allowed',
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

function EndIcon(props: any) {
  return <Iconify icon="ph:folder" {...props} />;
}
function CollapseIcon(props: any) {
  return <Iconify icon="ph:folder-minus" {...props} />;
}
function ExpandIcon(props: any) {
  return <Iconify icon="ph:folder-plus" {...props} />;
}

export default function CategorySelector({
  label,
  value,
  categoryId,
  onChange,
  disabled = false,
  multiple = false,
  is_primary = false,
  showOnlyPrimaries = false,
  directories = false,
  entities = false,
  restrict_primaries = false,
  filter_in_channel = false,
  channel_id,
  select_double_click = false,
}: Props) {
  const theme = useTheme();
  const search = useBoolean();
  const channelId = useParams();
  const { currentEntity } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
  }, [search]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const [expandedItems, setExpandedItems] = useState<ICategory['id'][]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState<ICategory | ICategory[] | null>(
    multiple ? value ?? null : value ?? null
  );

  const [buffer, setBuffer] = useState<ICategory | null>(null);
  const [items, setItems] = useState<ICategory[]>([]);

  const notFound = searchQuery && !items.length;

  const defaultSelected = getCategoryId(selected) ?? null;

  const handleItemSelection = (item: ICategory, doubleClick = false) => {
    if (disabled) return;
    if (select_double_click && doubleClick) {
      if (multiple) {
        setBuffer(item);
      } else {
        setSelected(item);
      }
    } else {
      setExpandedItems((old) => {
        const set: Set<string> = new Set(old);
        set[set.has(item.id) ? 'delete' : 'add'](item.id);
        return Array.from(set);
      });
    }

    if (restrict_primaries && 'is_primary' in item && item.is_primary) {
      return;
    }

    if (!select_double_click) {
      if (multiple) {
        setSelected((prevSelected) => {
          if (Array.isArray(prevSelected)) {
            const isSelected = prevSelected.some((selectedItem) => selectedItem.id === item.id);
            if (isSelected) {
              return prevSelected.filter((selectedItem) => selectedItem.id !== item.id);
            }
            return [...prevSelected, item];
          }
          return [item];
        });
      } else {
        setSelected(item);
      }
    }

    if (select_double_click && doubleClick) {
      const current = omit(item, 'parent', 'children');
      if (multiple) {
        const prev: ICategory[] = Array.isArray(selected) ? selected : [];
        let newVal: ICategory[];
        if (prev.find((v) => v.id === current.id)) {
          newVal = prev.filter((v) => v.id !== current.id);
        } else {
          newVal = [...prev, current];
        }
        onChange?.(newVal);
      } else {
        onChange?.(current);
      }
    } else if (!select_double_click) {
      const current = omit(item, 'parent', 'children');
      if (multiple) {
        const prev: ICategory[] = Array.isArray(selected) ? selected : [];
        let newVal: ICategory[];
        if (prev.find((v) => v.id === current.id)) {
          newVal = prev.filter((v) => v.id !== current.id);
        } else {
          newVal = [...prev, current];
        }
        onChange?.(newVal);
      } else {
        onChange?.(current);
      }
    }
  };

  const bindParent = (tree: ICategory[]): ICategory[] => {
    if (showOnlyPrimaries) {
      return tree.map((t) => ({ ...t, children: [] }));
    }
    const bindNodeParent = (node: ICategory, parent: ICategory | null = null) => {
      node.parent = parent;
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((item: any) => bindNodeParent(item, node));
      }
    };
    tree.forEach((item: any) => bindNodeParent(item));
    return tree;
  };

  const fetchTree = async () => {
    try {
      const config: {
        params: {
          only_primary?: boolean;
          only_directories?: boolean;
          filter_in_channel_id?: string;
        };
      } = {
        params: {},
      };
      if (is_primary) {
        config.params.only_primary = true;
      }
      if (directories) {
        config.params.only_directories = true;
      }
      if (channelId && filter_in_channel) {
        config.params.filter_in_channel_id = channel_id ?? (channelId.id as string);
      }

      const response = await fetcher([endpoints.categoryTree, config]);
      setItems(bindParent(response));
      // const itemIds: string[] = [];
      // type ItemType = { id: string; children?: Array<ItemType> };
      // (response as ItemType[]).forEach((item) => {
      //   itemIds.push(item.id);
      // });
      // setExpandedItems(itemIds);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao carregar árvore de categorias', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
  };

  const textTree = (nodes: ICategory | ICategory[] | null): string => {
    if (nodes === null) {
      return '';
    }
    const compute = (node: ICategory) => {
      const path: ICategory['name'][] = [];
      let i = 0;
      const maxIterations = 15;
      let currentNode: ICategory | null | undefined = node;
      while (currentNode && i < maxIterations) {
        path.push(currentNode.name);
        currentNode = currentNode.parent;
        i += 1;
      }
      return path.reverse().join('/');
    };
    return Array.isArray(nodes) ? nodes.map(compute).join(', ') : compute(nodes);
  };

  const clear = () => {
    const _value = null;
    setSelected(_value);
    setBuffer(_value);
    onChange?.(_value);
    if (entities) {
      setShowLabel('Entidade selecionada...');
    } else if (directories) {
      setShowLabel('Diretório selecionado...');
    } else {
      setShowLabel('Categorias selecionada...');
    }
  };

  const [showLabel, setShowLabel] = useState(
    // eslint-disable-next-line no-nested-ternary
    (Array.isArray(selected) ? selected.length > 0 : selected)
      ? textTree(selected)
      : // eslint-disable-next-line no-nested-ternary
        directories
        ? 'Diretório selecionado...'
        : entities
          ? 'Entidade selecionada...'
          : 'Categoria selecionada...'
  );

  const findLeafinTree = (tree: any, id: string): ICategory[] | null => {
    for (const item of tree) {
      if (item.id === id) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        if (findLeafinTree(item.children, id)) {
          return findLeafinTree(item.children, id);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (Array.isArray(selected) && selected.length > 0) {
      setShowLabel(textTree(selected));
    }
    if (selected !== null && !categoryId && !multiple) {
      setShowLabel(textTree(selected));
    }
    if (selected === null && !categoryId) {
      setShowLabel(
        // eslint-disable-next-line no-nested-ternary
        directories
          ? 'Diretório selecionado...'
          : entities
            ? 'Entidade selecionada...'
            : 'Categoria selecionada...'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    if (categoryId && typeof categoryId === 'string' && items.length > 0) {
      const foundItem = findLeafinTree(items, categoryId);
      if (foundItem) {
        setSelected(foundItem);
        setShowLabel(textTree(foundItem));
        onChange?.(foundItem);
      }
    }
    if (categoryId === null) {
      setSelected(null);
      setShowLabel(
        // eslint-disable-next-line no-nested-ternary
        directories
          ? 'Diretório selecionado...'
          : entities
            ? 'Entidade selecionada...'
            : 'Categoria selecionada...'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, items]);

  useEffect(() => {
    if (select_double_click && buffer) {
      setSelected((prevSelected) => {
        const currentSelected = Array.isArray(prevSelected) ? prevSelected : [];
        return [...currentSelected, buffer];
      });
      setBuffer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer, select_double_click]);
  useEffect(() => {
    fetchTree().then(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTree().then(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntity]);

  useEffect(() => {
    const searchTerm = searchQuery.toLowerCase();
    const matchNode = (node: ICategory) => {
      (node as any)._highlighted =
        searchTerm !== '' && node.name.toLowerCase().includes(searchTerm);
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(matchNode);
      }
    };
    setItems((old) =>
      old.map((item) => {
        matchNode(item);
        return item;
      })
    );
    // eslint-disable-next-line
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      return;
    }
    const expandedIds: string[] = [];
    const expandNode = (node: ICategory) => {
      if ((node as any)._highlighted) {
        let currentNode: ICategory | null | undefined = node;
        let maxDeep = 15;
        while (currentNode && currentNode.id && maxDeep >= 1) {
          expandedIds.push(currentNode.id);
          currentNode = currentNode.parent;
          maxDeep -= 1;
        }
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(expandNode);
      }
    };
    items.forEach(expandNode);
    setExpandedItems(expandedIds);
  }, [searchQuery, items]);

  const renderTree = (nodes: any) =>
    nodes.map((node: any) => (
      <CustomTreeItem
        data-cy={`category-selector-${node?.name}`}
        key={node.id}
        disabled={disabled}
        itemId={node.id}
        label={`${node.name} ${node?._count?.videos ? `(${node._count.videos})` : ''}`}
        onClick={() => handleItemSelection(node)}
        onDoubleClickCapture={() => handleItemSelection(node, select_double_click)}
        data-highlighted={node?._highlighted ? 'true' : 'false'}
        data-disabled={restrict_primaries && node.is_primary ? 'true' : 'false'}
      >
        {Array.isArray(node.children) ? renderTree(node.children) : null}
      </CustomTreeItem>
    ));

  const renderItems = () => (
    <SimpleTreeView
      expandedItems={expandedItems}
      selectedItems={defaultSelected as any}
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon,
        endIcon: EndIcon,
      }}
    >
      {renderTree(items)}
    </SimpleTreeView>
  );

  const renderButton = (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button
        size="large"
        variant="outlined"
        onClick={search.onTrue}
        data-cy="category-selector-button"
        disabled={disabled}
      >
        {label}
      </Button>
      <Box
        sx={{
          width: { md: '70%' },
        }}
      >
        <TextField
          name="category-selection-value"
          data-cy="category-selection-value"
          fullWidth
          type="text"
          value={showLabel}
        />
      </Box>
      {(Array.isArray(selected) ? selected.length > 0 : Boolean(selected)) && (
        <IconButton
          color="error"
          size="large"
          onClick={() => clear()}
          data-cy="category-clear-button"
          disabled={disabled}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      )}
    </Stack>
  );

  const renderDialog = (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={search.value}
      onClose={handleClose}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
      PaperProps={{
        sx: {
          overflow: 'unset',
          [theme.breakpoints.up('xl')]: {
            mt: 15,
          },
        },
      }}
      sx={{
        [`& .${dialogClasses.container}`]: {
          alignItems: 'flex-start',
        },
      }}
      data-cy="category-selector-dialog"
    >
      <Box
        sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}
        data-cy="category-selector-search"
      >
        <InputBase
          fullWidth
          autoFocus
          placeholder="Pesquisar..."
          value={searchQuery}
          onChange={handleSearch}
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          endAdornment={<Label sx={{ letterSpacing: 1, color: 'text.secondary' }}>esc</Label>}
          inputProps={{
            sx: { typography: 'h6' },
          }}
        />
      </Box>

      <Scrollbar sx={{ p: 3, pt: 2, height: 400 }}>
        {notFound ? (
          <SearchNotFound query={searchQuery} sx={{ py: 10 }} />
        ) : (
          <Box data-cy="category-selector-tree">{renderItems()}</Box>
        )}
      </Scrollbar>
      <Divider />

      <Stack sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ my: 2, width: 65 }}
          data-cy="category-selector-tree-button"
        >
          OK
        </Button>
      </Stack>
    </Dialog>
  );

  return (
    <div data-cy="category-selector">
      {renderButton}
      {renderDialog}
    </div>
  );
}
