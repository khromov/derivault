import type { Select as SelectPrimitive } from 'bits-ui';
import Root from './select.svelte';
import Trigger from './select-trigger.svelte';
import Content from './select-content.svelte';
import Item from './select-item.svelte';
import Value from './select-value.svelte';

type Props = SelectPrimitive.Props;
type Events = SelectPrimitive.Events;

export {
	Root,
	Trigger,
	Content,
	Item,
	Value,
	type Props,
	type Events,
	//
	Root as Select,
	Trigger as SelectTrigger,
	Content as SelectContent,
	Item as SelectItem,
	Value as SelectValue,
	type Props as SelectProps,
	type Events as SelectEvents
};