"use client";
import { motion, type Transition } from "framer-motion";
import { Link } from "react-router-dom";

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative h-full flex items-center">
      <motion.p
        transition={{ duration: 0.15 }}
        className={`cursor-pointer px-3 py-1.5 rounded-xs text-[13px] font-medium transition-colors duration-normal ${
          active === item 
            ? 'bg-surface-raised text-text-secondary' 
            : 'text-text-primary hover:text-text-secondary hover:bg-surface-muted'
        }`}
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2 pt-2">
              <motion.div
                transition={transition}
                layoutId="active"
                className="glass-panel rounded-sm overflow-hidden"
              >
                <motion.div layout className="w-max h-full">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative flex items-center justify-center gap-1 h-full"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link to={href} className="flex space-x-3 group p-2 hover:bg-surface-raised rounded-xs transition-colors duration-normal border border-transparent hover:border-subtle">
      <img
        src={src}
        width={120}
        height={68}
        alt={title}
        className="flex-shrink-0 w-28 h-[68px] rounded-xs object-cover"
      />
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="text-[13px] font-semibold mb-0.5 text-text-secondary group-hover:text-text-tertiary transition-colors duration-normal truncate">
          {title}
        </h4>
        <p className="text-text-primary text-[12px] max-w-[12rem] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, href, to, ...rest }: any) => {
  return (
    <Link
      to={to || href || '#'}
      {...rest}
      className="block text-[13px] text-text-primary hover:text-text-secondary hover:bg-surface-raised px-3 py-2 rounded-xs transition-colors duration-normal font-medium"
    >
      {children}
    </Link>
  );
};
