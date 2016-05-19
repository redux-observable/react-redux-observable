import React, { Component, PropTypes } from 'react';
import { Subscription } from 'rxjs/Subscription';

const $$reduxObservableSubscription = '@@reduxObservableSubscription';

const dispatchFactories = (subscription, store, factories, args) => {
  factories.map(factory => store.dispatch(factory(...args)))
    .forEach(sub => sub && subscription.add(sub));
};

export function dispatchOn({
  willMount = null,
  mount = null,
  update = null,
  willRecieveProps = null
}) {
  return (ComposedComponent) =>
    class DispatchOnMountComponent extends Component {
      constructor(props) {
        super(props);
      }

      static contextTypes = {
        store: PropTypes.object.isRequired
      }

      getSubscription() {
        const subscription = this[$$reduxObservableSubscription];
        if (!subscription || subscription.isUnsubscribed) {
          this[$$reduxObservableSubscription] = new Subscription();
        }
        return this[$$reduxObservableSubscription];
      }

      componentWillMount() {
        if (willMount) {
          dispatchFactories(this.getSubscription(), this.context.store, willMount, [this.props]);
        }
      }

      componentDidMount() {
        if (mount) {
          dispatchFactories(this.getSubscription(), this.context.store, mount, [this.props]);
        }
      }

      componentDidUpdate(prevProps) {
        if (update) {
          dispatchFactories(this.getSubscription(), this.context.store, update, [this.props, prevProps]);
        }
      }

      componentWillReceiveProps(nextProps) {
        if (willRecieveProps) {
          dispatchFactories(this.getSubscription(), this.context.store, willRecieveProps, [this.props, nextProps]);
        }
      }

      componentWillUnmount() {
        const subscription = this[$$reduxObservableSubscription];
        if (subscription) {
          subscription.unsubscribe();
        }
      }

      render() {
        return (<ComposedComponent {...this.props} />);
      }
    };
}
