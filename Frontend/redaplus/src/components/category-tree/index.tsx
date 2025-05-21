import { useSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import InputBase from '@mui/material/InputBase';
import TableBody from '@mui/material/TableBody';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

import Iconify from '../iconify';
import Scrollbar from '../scrollbar/scrollbar';
import { ICategory } from '../../types/category';
import SearchNotFound from '../search-not-found';
import { useAuthContext } from '../../auth/hooks';
import TableSkeleton from '../table/table-skeleton';
import { fetcher, endpoints } from '../../utils/axios';

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& [data-highlighted="true"] > .${treeItemClasses.content}`]: {
    background: theme.palette.warning.main,
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

export default function CategoryTree() {
  const theme = useTheme();

  const { currentEntity } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const [expandedItems, setExpandedItems] = useState<ICategory['id'][]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const [items, setItems] = useState<ICategory[]>([]);

  const notFound = searchQuery && !items.length;

  const handleItemSelection = (item: ICategory) => {
    setExpandedItems((old) => {
      const set: Set<string> = new Set(old);
      set[set.has(item.id) ? 'delete' : 'add'](item.id);
      return Array.from(set);
    });
  };

  const bindParent = (tree: ICategory[]): ICategory[] => {
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
    setLoading(true);
    try {
      const response = await fetcher(endpoints.categoryTree);
      setItems(bindParent(response));
      const itemIds: string[] = [];
      type ItemType = { id: string; children?: Array<ItemType> };
      (response as ItemType[]).forEach((item) => {
        itemIds.push(item.id);
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Erro ao carregar árvore de categorias', { variant: 'error' });
      if (error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

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
        data-cy={`category-tree-${node?.name}`}
        key={node.id}
        itemId={node.id}
        label={`${node.name} ${node?._count?.videos ? `(${node._count.videos})` : ''}`}
        onClick={() => handleItemSelection(node)}
        data-highlighted={node?._highlighted ? 'true' : 'false'}
      >
        {Array.isArray(node.children) ? renderTree(node.children) : null}
      </CustomTreeItem>
    ));

  const renderItems = () => (
    <SimpleTreeView
      expandedItems={expandedItems}
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon,
        endIcon: EndIcon,
      }}
    >
      {renderTree(items)}
    </SimpleTreeView>
  );

  return (
    <div data-cy="category-tree">
      <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
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
          inputProps={{
            sx: { typography: 'h6' },
          }}
        />
        {loading ? (
          <Table>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableSkeleton key={index} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <Scrollbar sx={{ p: 3, pt: 2, minHeight: 400 }}>
            {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderItems()}
          </Scrollbar>
        )}
      </Box>
    </div>
  );
}
