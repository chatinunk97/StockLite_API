-- CreateEnum
CREATE TYPE "Role" AS ENUM ('supervisor', 'employee', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "firstName" VARCHAR(30) NOT NULL,
    "lastName" VARCHAR(30) NOT NULL,
    "password" VARCHAR(225) NOT NULL,
    "userRole" "Role" NOT NULL DEFAULT 'employee',
    "email" VARCHAR(225) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "companyProfiles" (
    "companyId" SERIAL NOT NULL,
    "companyName" VARCHAR(225) NOT NULL,
    "companyLogo" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companyProfiles_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "supplierId" SERIAL NOT NULL,
    "supplierName" VARCHAR(225) NOT NULL,
    "supplierAddress" VARCHAR(225) NOT NULL,
    "supplierTel" VARCHAR(225) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplierId")
);

-- CreateTable
CREATE TABLE "orders" (
    "orderId" SERIAL NOT NULL,
    "receiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sumPrice" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "stocks" (
    "stockId" SERIAL NOT NULL,
    "productName" VARCHAR(225) NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "orderId" INTEGER NOT NULL,
    "refillCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("stockId")
);

-- CreateTable
CREATE TABLE "shelves" (
    "shelfItemId" SERIAL NOT NULL,
    "shelfQuantity" INTEGER,
    "stockId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("shelfItemId")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transactionId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "sumSale" INTEGER,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "transaction_to_product_shelf" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productShelfId" INTEGER NOT NULL,
    "transactionId" INTEGER NOT NULL,

    CONSTRAINT "transaction_to_product_shelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companyProfiles_companyName_key" ON "companyProfiles"("companyName");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companyProfiles"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companyProfiles"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("supplierId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("stockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_to_product_shelf" ADD CONSTRAINT "transaction_to_product_shelf_productShelfId_fkey" FOREIGN KEY ("productShelfId") REFERENCES "shelves"("shelfItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_to_product_shelf" ADD CONSTRAINT "transaction_to_product_shelf_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
