import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaBars, FaHeart, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { storeService } from "../../services/store.service";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import type { Store } from "../../types/api";
import "./FavoritesPage.css";

interface SortableItemProps {
  id: number;
  store: Store;
  onNavigate: (storeId: number) => void;
  onRemove: (storeId: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  store,
  onNavigate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <Card className="favorite-item">
        <div className="drag-handle" {...attributes} {...listeners}>
          <FaBars />
        </div>

        <div
          className="store-content"
          onClick={() => onNavigate(store.storeId)}
        >
          {store.imageUrl && (
            <img
              src={store.imageUrl}
              alt={store.storeName}
              className="store-image"
            />
          )}

          <div className="store-info">
            <h3 className="store-name">{store.storeName}</h3>
            <div className="store-meta">
              {store.distance && (
                <span className="distance">
                  <FaMapMarkerAlt /> {store.distance}km
                </span>
              )}
              <span className="review-count">
                <FaStar /> {store.reviewCount}
              </span>
              <span className="price">
                평균 {store.averagePrice.toLocaleString()}원
              </span>
            </div>
            <p className="store-address">{store.address}</p>
          </div>
        </div>

        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(store.storeId);
          }}
        >
          <FaHeart className="heart-filled" />
        </button>
      </Card>
    </div>
  );
};

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      // TODO: 즐겨찾기 목록 API 호출
      // const response = await storeService.getFavorites();
      // if (response.result === 'SUCCESS' && response.data) {
      //   setFavorites(response.data);
      // }

      // 임시 데이터
      setFavorites([]);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.findIndex((item) => item.storeId === active.id);
        const newIndex = items.findIndex((item) => item.storeId === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      // TODO: 순서 변경 API 호출
      // await storeService.updateFavoriteOrder(reorderedIds);
    }
  };

  const handleRemoveFavorite = async (storeId: number) => {
    if (window.confirm("즐겨찾기에서 삭제하시겠습니까?")) {
      try {
        await storeService.removeFavorite(storeId);
        setFavorites((prev) =>
          prev.filter((store) => store.storeId !== storeId)
        );
      } catch (error) {
        console.error("Failed to remove favorite:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1>즐겨찾는 가게</h1>
      </header>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <FaHeart className="empty-icon" />
          <p>즐겨찾는 가게가 없습니다</p>
          <Button variant="primary" onClick={() => navigate("/recommendation")}>
            가게 둘러보기
          </Button>
        </div>
      ) : (
        <div className="favorites-content">
          <div className="drag-hint">
            <FaBars /> 꾹 눌러서 순서를 변경하세요
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={favorites.map((store) => store.storeId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="favorites-list">
                {favorites.map((store) => (
                  <SortableItem
                    key={store.storeId}
                    id={store.storeId}
                    store={store}
                    onNavigate={(id) => navigate(`/store/${id}`)}
                    onRemove={handleRemoveFavorite}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
