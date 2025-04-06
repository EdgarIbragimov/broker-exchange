import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  fetchBrokers,
  createBroker,
  updateBroker,
  deleteBroker,
} from "../redux/slices/brokersSlice";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { Broker } from "../types";
import BrokerRow from "../components/BrokerRow";
import BrokerForm from "../components/BrokerForm";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
`;

const TableHead = styled.thead`
  background-color: #f5f8fa;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:last-child {
    text-align: right;
  }
`;

const TableBody = styled.tbody``;

const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const PageHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const AddButton = styled.button`
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #3a7bc8;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const Message = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 10px;
  margin-bottom: 15px;
  background-color: rgba(226, 92, 92, 0.1);
  color: #e25c5c;
  border-radius: 4px;
  border-left: 4px solid #e25c5c;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
`;

const BrokersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { brokers, loading, error } = useAppSelector((state) => state.brokers);

  const [showModal, setShowModal] = useState(false);
  const [currentBroker, setCurrentBroker] = useState<Broker | null>(null);

  useEffect(() => {
    dispatch(fetchBrokers());
  }, [dispatch]);

  const handleOpenModal = (broker?: Broker) => {
    setCurrentBroker(broker || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentBroker(null);
  };

  const handleSubmit = (data: { name: string; balance: number }) => {
    if (currentBroker) {
      dispatch(
        updateBroker({
          id: currentBroker.id,
          updates: data,
        })
      );
    } else {
      dispatch(createBroker(data));
    }
    handleCloseModal();
  };

  const handleDeleteBroker = (id: string) => {
    if (window.confirm("Вы действительно хотите удалить этого брокера?")) {
      dispatch(deleteBroker(id));
    }
  };

  return (
    <PageContainer>
      <PageHeaderContainer>
        <PageTitle>Список брокеров</PageTitle>
        <AddButton onClick={() => handleOpenModal()}>
          Добавить брокера
        </AddButton>
      </PageHeaderContainer>

      {loading ? (
        <Message>Загрузка...</Message>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : brokers.length === 0 ? (
        <Message>Список брокеров пуст. Добавьте первого брокера.</Message>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Имя</TableHeader>
              <TableHeader>Баланс</TableHeader>
              <TableHeader>Действия</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {brokers.map((broker) => (
              <BrokerRow
                key={broker.id}
                broker={broker}
                onEdit={handleOpenModal}
                onDelete={handleDeleteBroker}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {showModal && (
        <ModalOverlay>
          <Modal>
            <BrokerForm
              broker={currentBroker}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
            />
          </Modal>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default BrokersPage;
